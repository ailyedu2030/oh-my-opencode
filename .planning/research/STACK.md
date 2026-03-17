# Stack Research: A股多智能体量化交易系统

## 核心框架

### 多智能体框架

| 框架 | 推荐度 | 说明 |
|-----|-------|------|
| **LangGraph** | ⭐⭐⭐⭐⭐ | 图结构，适合复杂状态管理，2025主流选择 |
| **CrewAI** | ⭐⭐⭐⭐ | 角色分配，batteries-included，上手快 |
| **AutoGen** | ⭐⭐⭐⭐ | Microsoft出品，多Agent协作 |

**推荐选择**: LangGraph (灵活度高) 或 CrewAI (快速开发)

### LLM后端

| 模型 | 推荐度 | 场景 |
|-----|-------|------|
| **DeepSeek V3** | ⭐⭐⭐⭐⭐ | 主力模型，性价比高，中文理解强 |
| **GPT-4** | ⭐⭐⭐⭐ | 代码生成，质量最高 |
| **Qwen** | ⭐⭐⭐ | 阿里系，中文能力强 |

**推荐组合**: DeepSeek(主力) + GPT-4(代码)

## 数据层

### A股数据API

| 数据源 | 推荐度 | 说明 |
|-------|-------|------|
| **AKShare** | ⭐⭐⭐⭐⭐ | 完全免费，数据源广，无需注册 |
| **Tushare Pro** | ⭐⭐⭐⭐ | 付费，质量高，需积分 |
| **双源整合** | ⭐⭐⭐⭐⭐ | 推荐：AKShare为主 + Tushare备选 |

**推荐**: AKShare (免费) + 未来可加Tushare Pro

### 回测框架

| 框架 | 说明 |
|-----|------|
| **Backtrader** | 老牌，稳定 |
| **Zipline** | Quantopian开源 |
| **VectorBT** | 高速，向量化 |

## 推荐技术栈

```
核心:
- Python 3.10+
- LangGraph 或 CrewAI (多Agent框架)
- DeepSeek API (主力LLM)
- AKShare (数据源)

可选:
- GPT-4 API (代码生成)
- Backtrader (回测)
- Pandas/NumPy (数据分析)
```

## 置信度: ⭐⭐⭐⭐

**参考来源**:
- LangGraph vs CrewAI 2025对比
- AKShare/Tushare对比测评
