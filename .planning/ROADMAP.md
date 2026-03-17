# Roadmap: A股多智能体量化交易系统

**Created:** 2025-03-17
**Granularity:** Fine (10 phases)

---

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|-------------------|
| 1 | 数据层搭建 | 接入AKShare数据源，建立缓存和质量检查 | DATA-01~03 | 3 |
| 2 | 核心信息Agent | 开发6个信息收集Agent | INFO-01~06 | 6 |
| 3 | 决策Agent开发 | 开发5个决策Agent和投票机制 | DECI-01~05 | 5 |
| 4 | 评级与权重 | 实现A/B/C评级和动态权重 | RATI-01~03 | 3 |
| 5 | 风控系统 | 实现仓位/止损/分散度/熔断 | RISK-01~04 | 4 |
| 6 | 方差缩小 | 实现信号聚合和多源验证 | VARR-01~03 | 3 |
| 7 | 回测框架 | 搭建回测系统，支持IC/IR检验 | BACK-01~03 | 3 |
| 8 | 集成测试 | 端到端流程打通 | 全部v1 | 5 |
| 9 | 模拟盘验证 | 跑通模拟盘，验证策略有效性 | 全部v1 | 3 |
| 10 | 优化迭代 | 根据模拟盘结果优化改进 | 全部v1 | 3 |

---

## Phase Details

### Phase 1: 数据层搭建
**Goal:** 接入AKShare数据源，建立缓存和质量检查

**Requirements:**
- DATA-01: AKShare数据接入 - 实时行情/日线/K线
- DATA-02: 数据缓存系统 - 避免重复请求
- DATA-03: 数据质量检查 - 缺失值/异常值处理

**Success Criteria:**
1. 能够通过AKShare获取A股日线数据
2. 数据缓存正常工作，重复请求从缓存返回
3. 数据质量检查能识别并标记异常值

---

### Phase 2: 核心信息Agent
**Goal:** 开发6个信息收集Agent

**Requirements:**
- INFO-01: 政策解读Agent - 监控证监会/央行/国务院政策
- INFO-02: 行业动态Agent - 申万行业涨跌/资金流向
- INFO-03: 财报分析Agent - 业绩预告/财报解读
- INFO-04: 资金流向Agent - 主力/北向/融资融券
- INFO-05: 个股舆情Agent - 新闻/股吧/雪球舆情
- INFO-06: 技术形态Agent - K线/均线/技术指标

**Success Criteria:**
1. 6个Agent都能正常运行并输出结构化信息
2. 每个Agent输出包含signal/strength/rating字段
3. Agent能够处理异常情况（数据缺失/API失败）

---

### Phase 3: 决策Agent开发
**Goal:** 开发5个决策Agent和投票机制

**Requirements:**
- DECI-01: 宏观策略Agent - 市场大局观/仓位建议
- DECI-02: 行业轮动Agent - 行业配置建议
- DECI-03: 因子量化Agent - 因子信号/选股建议
- DECI-04: 情绪资金Agent - 市场情绪/时机建议
- DECI-05: 风控合规Agent - 仓位/止损/分散度检查

**Success Criteria:**
1. 5个Agent都能接收信息层输入并输出决策
2. 投票机制正常工作（≥3/5同向则执行）
3. 风控Agent具有一票否决权

---

### Phase 4: 评级与权重
**Goal:** 实现A/B/C评级和动态权重

**Requirements:**
- RATI-01: 置信度评级 - A级(90%+)/B级(70-90%)/C级(<70%)
- RATI-02: 信号强度 - 0-100量化评分
- RATI-03: 动态权重 - 根据市场状态/Agent表现调整

**Success Criteria:**
1. 评级计算逻辑正确（A/B/C）
2. 动态权重能根据配置调整
3. 权重调整有日志记录

---

### Phase 5: 风控系统
**Goal:** 实现仓位/止损/分散度/熔断

**Requirements:**
- RISK-01: 仓位控制 - 单票≤15%/行业≤30%
- RISK-02: 止损机制 - 单票-7%/组合-15%
- RISK-03: 分散度要求 - 最少10只/≥3行业
- RISK-04: 熔断机制 - 大跌减仓/连续亏损休息

**Success Criteria:**
1. 仓位检查能识别超限并阻止开仓
2. 止损触发能自动减仓
3. 熔断机制在大跌时自动执行

---

### Phase 6: 方差缩小
**Goal:** 实现信号聚合和多源验证

**Requirements:**
- VARR-01: 信号聚合引擎 - 多源信息融合
- VARR-02: 多源验证 - ≥3同向信号确认
- VARR-03: 因子正交化 - 独立因子筛选

**Success Criteria:**
1. 多源信号能正确聚合
2. 同向信号确认机制正常工作
3. 因子相关性分析能识别冗余

---

### Phase 7: 回测框架
**Goal:** 搭建回测系统，支持IC/IR检验

**Requirements:**
- BACK-01: 回测框架 - VectorBT/Backtrader
- BACK-02: 因子检验 - IC/IR/分组回测
- BACK-03: 样本外验证 - 训练集/测试集分离

**Success Criteria:**
1. 回测引擎能正常运行
2. IC/IR计算正确
3. 样本外验证流程完整

---

### Phase 8: 集成测试
**Goal:** 端到端流程打通

**Success Criteria:**
1. 信息收集→分析→决策→风控全流程跑通
2. 决策结果能生成并展示
3. 日志记录完整可追溯

---

### Phase 9: 模拟盘验证
**Goal:** 跑通模拟盘，验证策略有效性

**Success Criteria:**
1. 模拟盘能运行至少1个月
2. 决策建议能被记录
3. 绩效统计能生成

---

### Phase 10: 优化迭代
**Goal:** 根据模拟盘结果优化改进

**Success Criteria:**
1. 问题被识别并记录
2. 优化措施被实施
3. 改进效果被验证

---

## v1 Requirements Mapping

| Requirement | Phase |
|-------------|-------|
| DATA-01 | Phase 1 |
| DATA-02 | Phase 1 |
| DATA-03 | Phase 1 |
| INFO-01 | Phase 2 |
| INFO-02 | Phase 2 |
| INFO-03 | Phase 2 |
| INFO-04 | Phase 2 |
| INFO-05 | Phase 2 |
| INFO-06 | Phase 2 |
| DECI-01 | Phase 3 |
| DECI-02 | Phase 3 |
| DECI-03 | Phase 3 |
| DECI-04 | Phase 3 |
| DECI-05 | Phase 3 |
| RATI-01 | Phase 4 |
| RATI-02 | Phase 4 |
| RATI-03 | Phase 4 |
| RISK-01 | Phase 5 |
| RISK-02 | Phase 5 |
| RISK-03 | Phase 5 |
| RISK-04 | Phase 5 |
| VARR-01 | Phase 6 |
| VARR-02 | Phase 6 |
| VARR-03 | Phase 6 |
| BACK-01 | Phase 7 |
| BACK-02 | Phase 7 |
| BACK-03 | Phase 7 |

---

*Roadmap created: 2025-03-17*
