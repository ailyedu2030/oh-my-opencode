# Requirements: A股多智能体量化交易系统

**Defined:** 2025-03-17
**Core Value:** 让AI成为您的"虚拟投研团队" — 10+个AI Agent实时监控市场信息，5个决策Agent联合给出投资建议，方差缩小提升信号质量，最终由您确认执行。

## v1 Requirements

### Data (数据层)

- [ ] **DATA-01**: AKShare数据接入 - 实时行情/日线/K线
- [ ] **DATA-02**: 数据缓存系统 - 避免重复请求
- [ ] **DATA-03**: 数据质量检查 - 缺失值/异常值处理

### Info Collection (信息收集)

- [ ] **INFO-01**: 政策解读Agent - 监控证监会/央行/国务院政策
- [ ] **INFO-02**: 行业动态Agent - 申万行业涨跌/资金流向
- [ ] **INFO-03**: 财报分析Agent - 业绩预告/财报解读
- [ ] **INFO-04**: 资金流向Agent - 主力/北向/融资融券
- [ ] **INFO-05**: 个股舆情Agent - 新闻/股吧/雪球舆情
- [ ] **INFO-06**: 技术形态Agent - K线/均线/技术指标

### Decision (决策层)

- [ ] **DECI-01**: 宏观策略Agent - 市场大局观/仓位建议
- [ ] **DECI-02**: 行业轮动Agent - 行业配置建议
- [ ] **DECI-03**: 因子量化Agent - 因子信号/选股建议
- [ ] **DECI-04**: 情绪资金Agent - 市场情绪/时机建议
- [ ] **DECI-05**: 风控合规Agent - 仓位/止损/分散度检查

### Rating (评级系统)

- [ ] **RATI-01**: 置信度评级 - A级(90%+)/B级(70-90%)/C级(<70%)
- [ ] **RATI-02**: 信号强度 - 0-100量化评分
- [ ] **RATI-03**: 动态权重 - 根据市场状态/Agent表现调整

### Variance Reduction (方差缩小)

- [ ] **VARR-01**: 信号聚合引擎 - 多源信息融合
- [ ] **VARR-02**: 多源验证 - ≥3同向信号确认
- [ ] **VARR-03**: 因子正交化 - 独立因子筛选

### Risk Control (风控)

- [ ] **RISK-01**: 仓位控制 - 单票≤15%/行业≤30%
- [ ] **RISK-02**: 止损机制 - 单票-7%/组合-15%
- [ ] **RISK-03**: 分散度要求 - 最少10只/≥3行业
- [ ] **RISK-04**: 熔断机制 - 大跌减仓/连续亏损休息

### Backtest (回测)

- [ ] **BACK-01**: 回测框架 - VectorBT/Backtrader
- [ ] **BACK-02**: 因子检验 - IC/IR/分组回测
- [ ] **BACK-03**: 样本外验证 - 训练集/测试集分离

## v2 Requirements

### Advanced Features

- **VARR-04**: 时效衰减 - 新信号权重更高
- **INFO-07**: 全球宏观Agent - 美联储/全球宏观
- **INFO-08**: 地缘政治Agent - 中美关系/区域冲突
- **INFO-09**: 外盘联动Agent - 美股/港股/汇率
- **INFO-10**: 因子挖掘Agent - RD-Agent集成

### Live Trading

- **LIVE-01**: 实盘接口 - 券商API对接
- **LIVE-02**: 实时风控 - 盘中监控告警

## Out of Scope

| Feature | Reason |
|---------|--------|
| 实盘自动交易 | 模拟盘验证充分后再考虑 |
| 高频交易 | 专注短线/中线信号 |
| 杠杆/期权 | 初期仅做现货 |
| 单一Agent决策 | 必须多Agent联合 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| INFO-01 ~ 06 | Phase 2 | Pending |
| DECI-01 ~ 05 | Phase 3 | Pending |
| RATI-01 ~ 03 | Phase 3 | Pending |
| VARR-01 ~ 03 | Phase 4 | Pending |
| RISK-01 ~ 04 | Phase 3 | Pending |
| BACK-01 ~ 03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---

*Requirements defined: 2025-03-17*
*Last updated: 2025-03-17 after research*
