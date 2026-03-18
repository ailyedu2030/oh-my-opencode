---
phase: 2
slug: core-information-agent
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 7.x |
| **Config file** | `quant/pytest.ini` |
| **Quick run command** | `cd quant && python -m pytest tests/test_agents/ -v` |
| **Full suite command** | `cd quant && python -m pytest tests/ -v` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd quant && python -m pytest tests/test_agents/ -v`
- **After every plan wave:** Run `cd quant && python -m pytest tests/ -v`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | INFO-01 | unit | `pytest tests/test_agents/test_policy_agent.py::test_policy_agent_collect` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | INFO-01 | unit | `pytest tests/test_agents/test_policy_agent.py::test_policy_agent_analyze` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 1 | INFO-01 | unit | `pytest tests/test_agents/test_policy_agent.py::test_policy_agent_format_output` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 1 | INFO-02 | unit | `pytest tests/test_agents/test_industry_agent.py::test_industry_agent_collect` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 1 | INFO-02 | unit | `pytest tests/test_agents/test_industry_agent.py::test_industry_agent_analyze` | ❌ W0 | ⬜ pending |
| 2-02-03 | 02 | 1 | INFO-02 | unit | `pytest tests/test_agents/test_industry_agent.py::test_industry_agent_format_output` | ❌ W0 | ⬜ pending |
| 2-03-01 | 03 | 2 | INFO-03 | unit | `pytest tests/test_agents/test_financial_agent.py::test_financial_agent_collect` | ❌ W0 | ⬜ pending |
| 2-03-02 | 03 | 2 | INFO-03 | unit | `pytest tests/test_agents/test_financial_agent.py::test_financial_agent_analyze` | ❌ W0 | ⬜ pending |
| 2-03-03 | 03 | 2 | INFO-03 | unit | `pytest tests/test_agents/test_financial_agent.py::test_financial_agent_format_output` | ❌ W0 | ⬜ pending |
| 2-04-01 | 04 | 2 | INFO-04 | unit | `pytest tests/test_agents/test_fund_flow_agent.py::test_fund_flow_agent_collect` | ❌ W0 | ⬜ pending |
| 2-04-02 | 04 | 2 | INFO-04 | unit | `pytest tests/test_agents/test_fund_flow_agent.py::test_fund_flow_agent_analyze` | ❌ W0 | ⬜ pending |
| 2-04-03 | 04 | 2 | INFO-04 | unit | `pytest tests/test_agents/test_fund_flow_agent.py::test_fund_flow_agent_format_output` | ❌ W0 | ⬜ pending |
| 2-05-01 | 05 | 3 | INFO-05 | unit | `pytest tests/test_agents/test_opinion_agent.py::test_opinion_agent_collect` | ❌ W0 | ⬜ pending |
| 2-05-02 | 05 | 3 | INFO-05 | unit | `pytest tests/test_agents/test_opinion_agent.py::test_opinion_agent_analyze` | ❌ W0 | ⬜ pending |
| 2-05-03 | 05 | 3 | INFO-05 | unit | `pytest tests/test_agents/test_opinion_agent.py::test_opinion_agent_format_output` | ❌ W0 | ⬜ pending |
| 2-06-01 | 06 | 3 | INFO-06 | unit | `pytest tests/test_agents/test_technical_agent.py::test_technical_agent_collect` | ❌ W0 | ⬜ pending |
| 2-06-02 | 06 | 3 | INFO-06 | unit | `pytest tests/test_agents/test_technical_agent.py::test_technical_agent_analyze` | ❌ W0 | ⬜ pending |
| 2-06-03 | 06 | 3 | INFO-06 | unit | `pytest tests/test_agents/test_technical_agent.py::test_technical_agent_format_output` | ❌ W0 | ⬜ pending |
| 2-07-01 | 07 | 4 | ALL | integration | `pytest tests/test_agents/test_coordinator.py::test_coordinator_run_all_agents` | ❌ W0 | ⬜ pending |
| 2-07-02 | 07 | 4 | ALL | integration | `pytest tests/test_agents/test_scheduler.py::test_scheduler_execution` | ❌ W0 | ⬜ pending |
| 2-07-03 | 07 | 4 | ALL | integration | `pytest tests/test_agents/test_integration.py::test_end_to_end_workflow` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `quant/tests/test_agents/` — directory structure for agent tests
- [ ] `quant/tests/test_agents/test_policy_agent.py` — stubs for INFO-01
- [ ] `quant/tests/test_agents/test_industry_agent.py` — stubs for INFO-02
- [ ] `quant/tests/test_agents/test_financial_agent.py` — stubs for INFO-03
- [ ] `quant/tests/test_agents/test_fund_flow_agent.py` — stubs for INFO-04
- [ ] `quant/tests/test_agents/test_opinion_agent.py` — stubs for INFO-05
- [ ] `quant/tests/test_agents/test_technical_agent.py` — stubs for INFO-06
- [ ] `quant/tests/test_agents/test_coordinator.py` — stubs for coordinator tests
- [ ] `quant/tests/test_agents/test_scheduler.py` — stubs for scheduler tests
- [ ] `quant/tests/test_agents/test_integration.py` — stubs for integration tests
- [ ] `quant/tests/test_agents/conftest.py` — shared fixtures for agent testing
- [ ] `quant/src/agents/` — directory structure for agent source code

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Web scraping stability | INFO-01, INFO-05 | External websites may change structure | 1. Run policy agent 2. Verify it can parse CSRC website 3. Run opinion agent 4. Verify it can parse financial news sites |
| LLM analysis quality | ALL | Subjective analysis quality | 1. Run each agent 2. Review analysis output for coherence 3. Check signal aligns with data |
| Real-time data freshness | INFO-02, INFO-04 | Depends on external API timing | 1. Run industry/fund flow agents 2. Verify data timestamps are recent 3. Check for stale data warnings |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending