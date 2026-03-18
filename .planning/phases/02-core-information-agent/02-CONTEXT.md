# Phase 2: 核心信息Agent - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

开发6个信息收集Agent，实时监控A股市场信息并输出结构化分析结果。

具体包括：
1. 政策解读Agent - 监控证监会/央行/国务院政策
2. 行业动态Agent - 申万行业涨跌/资金流向
3. 财报分析Agent - 业绩预告/财报解读
4. 资金流向Agent - 主力/北向/融资融券
5. 个股舆情Agent - 新闻/股吧/雪球舆情
6. 技术形态Agent - K线/均线/技术指标

范围限于信息收集和分析Agent开发，不包含决策逻辑或交易执行。

</domain>

<decisions>
## Implementation Decisions

### Agent Architecture
- **结构设计**: 共享基类(BaseAgent)模式，包含通用功能(LLM集成、错误处理、日志记录)，各具体Agent继承扩展
- **项目位置**: `quant/src/agents/` 目录，各Agent文件按类型命名(`policy_agent.py`, `industry_agent.py`等)
- **接口规范**: 严格接口要求，所有Agent必须实现特定方法(`collect()`, `analyze()`, `format_output()`)
- **配置管理**: 集中式YAML配置文件，与现有配置模式保持一致
- **状态管理**: 混合模式 - 无状态执行但可读写共享状态存储

### Data Sources
- **数据源策略**: 混合免费数据源，不依赖付费API
- **政策Agent**: 政府官网(证监会/央行/国务院)RSS/API，初期手动爬取
- **行业Agent**: AKShare申万行业分类数据，利用现有基础设施
- **财报Agent**: AKShare财报/业绩预告数据，统一数据源
- **舆情Agent**: RSS订阅 + 网页爬取(主流财经媒体、股吧、雪球)
- **失败处理**: 优雅降级 - 主数据源失败时使用备用源或跳过分析
- **缓存策略**: 重用Phase 1的ParquetCacheManager进行数据缓存

### Output Format
- **输出结构**: 标准化JSON schema，包含基础字段 + Agent特定扩展字段
- **基础字段**: agent_type, timestamp, signal, strength, rating, confidence
- **信号定义**: 混合方法 - 数值范围(-1到1) + 文本描述
- **时间戳**: 双时间戳 - data_timestamp(数据收集时间)和analysis_timestamp(分析时间)
- **存储格式**: Parquet文件，与Phase 1基础设施保持一致

### Scheduling & Execution
- **调度策略**: 固定时间表，各Agent按自身频率运行(政策每日、财报季度等)
- **执行模式**: 并行执行，所有Agent可并发运行
- **失败处理**: 指数退避重试机制，处理瞬时故障
- **调度管理**: 中央调度器组件，统一管理所有Agent调度
- **监控机制**: 详细日志记录(开始/结束时间、数据源、结果、错误)
- **超时设置**: 可配置超时时间(默认5分钟)，防止挂起

### Integration with Phase 1
- **数据消费**: 直接文件访问 - Agent读取Phase 1缓存的Parquet文件
- **质量检查**: 强制使用Phase 1质量检查，确保数据质量一致性
- **格式兼容**: 标准化Parquet格式，所有Phase 1输出和Agent输入使用Parquet
- **数据获取**: 通过现有CLI命令触发Phase 1数据获取
- **版本管理**: 语义化版本控制，确保Phase间兼容性

### Agent Communication
- **通信需求**: 完全通信 - Agent可共享中间结果，协作分析
- **信息共享**: 共享存储 - Agent通过共享Parquet存储读写信息
- **协调机制**: 协调器Agent - 中央Agent协调其他Agent，聚合结果
- **冲突解决**: 投票机制 - 多个Agent对信号进行投票，内置冲突解决

### Claude's Discretion
- 具体LLM提示工程和Agent分析逻辑
- 网页爬取的具体实现和技术选择
- 调度器的具体实现(APScheduler vs cron vs 自定义)
- 协调器Agent的具体算法和协调逻辑
- 监控仪表盘的具体设计和实现
- 错误重试的具体退避算法参数

</decisions>

<specifics>
## Specific Ideas

- Agent输出需包含signal/strength/rating字段，符合成功标准
- 系统需面向技术新手，配置简单，错误提示友好
- 考虑AKShare API限制和稳定性，设计相应容错机制
- 舆情Agent需处理中文自然语言，考虑中文LLM优化
- 技术形态Agent需集成常见技术指标计算库

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- **DeepSeekAnalyzer** (`quant/src/llm/deepseek_analyzer.py`): DeepSeek LLM集成，可直接用于Agent分析
- **AKShareFetcher** (`quant/src/data_fetcher/akshare_fetcher.py`): AKShare数据获取，行业/财报Agent可重用
- **ParquetCacheManager** (`quant/src/data_cache/parquet_cache.py`): Parquet缓存管理，Agent数据缓存
- **BasicQualityChecker** (`quant/src/quality_check/basic_checks.py`): 质量检查，确保Agent输入数据质量
- **统一CLI工具** (`quant/src/cli.py`): 命令行界面，可扩展Agent管理命令

### Established Patterns
- **错误处理模式**: 指数退避重试、详细日志记录、优雅降级(Phase 1建立)
- **配置管理**: YAML配置文件、环境变量覆盖、默认值设置
- **数据流水线**: 获取→缓存→检查→转换的模块化设计
- **日志记录**: 结构化日志、不同严重级别、上下文信息

### Integration Points
- **数据流入口**: Phase 1 Parquet输出文件作为Agent输入
- **扩展点**: 可插拔Agent注册、可配置调度策略、可扩展输出格式
- **监控集成**: 可集成现有监控系统(Prometheus、Grafana等)
- **协调接口**: 协调器Agent与各信息Agent的通信接口

</code_context>

<deferred>
## Deferred Ideas

- **高级自然语言处理**: 复杂情感分析、主题建模属于优化阶段
- **实时数据流处理**: 流式数据处理架构属于基础设施增强
- **多模型集成**: 集成多个LLM提供商属于未来优化
- **用户交互界面**: 当前为CLI，GUI界面属于未来增强
- **高级协调算法**: 复杂多Agent协作算法属于研究范畴

</deferred>

---

*Phase: 02-core-information-agent*
*Context gathered: 2026-03-18*