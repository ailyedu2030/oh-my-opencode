# Research Summary: A股多智能体量化交易系统

## Key Findings

### Stack (技术栈)
- **框架**: LangGraph (生产) 或 CrewAI (快速开发)
- **LLM**: DeepSeek V3 (主力) + GPT-4 (代码)
- **数据**: AKShare (免费) + 未来可加Tushare Pro
- **回测**: VectorBT (研究) + Backtrader (执行)

### Features (功能)
- **Table Stakes**: 多数据源 + 投票机制 + 风控
- **Differentiators**: 方差缩小 + Agent专业化 + 因子挖掘

### Architecture (架构)
- 5层: 用户 → 决策 → 分析 → 信息收集 → 数据
- 数据流: Agent并行 → 信号聚合 → 联合决策 → 风控 → 人工确认

### Watch Out (注意事项)
- 数据源限速/失效
- Agent决策分歧
- 因子过拟合
- 风控必须严格

---

**置信度**: ⭐⭐⭐⭐

**下一步**: 定义需求 → 创建路线图
