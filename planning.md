# Code Review Assistant - Multi-Agent System Planning

## Overview
Build a simple 1-file `agent.py` example using Google ADK (Agent Development Kit) Python with OpenAI API key from `.env` file. The system will create an autonomous code analyzer with multi-repository context.

## Project Description
**Code Review Assistant**: An autonomous agent that automatically:
- Reviews code changes
- Analyzes code quality
- Detects potential security issues
- Generates analysis reports

## Tech Stack
| Component | Tool |
|-----------|------|
| Framework | Google ADK (google-adk) Python |
| LLM Provider | OpenAI (via `.env` key) |
| Configuration | python-dotenv |
| Output Format | Console/Markdown report |

---

## Architecture

### Multi-Agent Hierarchy
```
Coordinator (Parent Agent)
├── Code Reviewer Agent (Child)
├── Quality Analyzer Agent (Child)
└── Security Scanner Agent (Child)
```

### Agent Responsibilities

| Agent | Role | Description |
|-------|------|-------------|
| **Coordinator** | Orchestration | Receives user input, delegates tasks to sub-agents, compiles final report |
| **Code Reviewer** | Code Analysis | Reviews code changes, checks for best practices, suggests improvements |
| **Quality Analyzer** | Quality Metrics | Analyzes code quality, complexity, maintainability, naming conventions |
| **Security Scanner** | Security Analysis | Detects potential vulnerabilities (injection, XSS, hardcoded secrets, etc.) |

---

## Implementation Plan

### Step 1: Project Setup
- [ ] Create `.env` file with `OPENAI_API_KEY`
- [ ] Install dependencies: `google-adk`, `python-dotenv`, `openai`

### Step 2: Base Configuration
- [ ] Create environment loader function
- [ ] Set up OpenAI client configuration
- [ ] Define common prompt templates

### Step 3: Define Sub-Agents
```python
from google.adk.agents import LlmAgent

code_reviewer = LlmAgent(
    name="code_reviewer",
    model="openai/gpt-4o-mini",
    description="Reviews code changes and suggests improvements",
    instruction="You are a code reviewer. Analyze the provided code..."
)

quality_analyzer = LlmAgent(
    name="quality_analyzer",
    model="openai/gpt-4o-mini",
    description="Analyzes code quality metrics"
)

security_scanner = LlmAgent(
    name="security_scanner",
    model="openai/gpt-4o-mini",
    description="Scans for security vulnerabilities"
)
```

### Step 4: Define Coordinator Agent
```python
coordinator = LlmAgent(
    name="coordinator",
    model="openai/gpt-4o-mini",
    description="Coordinates code review analysis",
    sub_agents=[
        code_reviewer,
        quality_analyzer,
        security_scanner
    ]
)
```

### Step 5: Main Execution Flow
- [ ] Accept code input (file path, diff, or code snippet)
- [ ] Route through coordinator
- [ ] Aggregate results from sub-agents
- [ ] Format and display report

### Step 6: Output Format
```markdown
# Code Review Report

## Code Reviewer Analysis
- [Findings...]

## Quality Analysis
- [Metrics...]

## Security Scan
- [Vulnerabilities...]

## Summary
[Overall assessment]
```

---

## File Structure
```
adk-code-review-simple/
├── agent/                    # Agent package (REQUIRED by adk web)
│   ├── __init__.py          # Package init, exports root_agent
│   ├── agent.py             # Main multi-agent implementation with root_agent
│   ├── .env                 # OpenAI API key (REQUIRED)
│   └── .env.example         # Example env file
├── .gitignore               # Git ignore rules
├── planning.md              # This file
├── requirements.txt         # Dependencies
└── README.md                # Documentation
```

---

## Key Features to Implement

### 1. Input Handling
- Accept file path as argument
- Read code file content
- Support for multiple file types (.py, .js, .ts, .go, etc.)

### 2. Agent Communication
- Coordinator delegates specific tasks
- Each sub-agent specializes in its domain
- Results aggregated back to coordinator

### 3. Report Generation
- Structured markdown output
- Severity levels for issues
- Actionable recommendations

---

## Example Usage

### Option 1: Using ADK Web (Recommended for testing)
```bash
# From project root (parent of agent/ folder)
adk web

# Then open http://localhost:8000
# Select "code_review_coordinator" agent
# Type: "Review the file at /path/to/code.py"
```

**IMPORTANT**: `adk web` must be run from the **parent directory** of your `agent/` folder, not inside it.

### Option 2: Using ADK Run CLI
```bash
# From project root
adk run

# Select agent and provide file path
```

### Option 3: Direct Python (if needed)
```bash
python -m agent.agent /path/to/code.py
```

## Expected Output
```
🔍 Code Review Assistant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyzing: /path/to/code.py

📊 Code Reviewer Analysis:
✓ Code follows PEP 8 guidelines
⚠ Line 42: Variable 'x' has unclear name

📈 Quality Analysis:
- Cyclomatic Complexity: 3 (Good)
- Maintainability Index: 85/100

🔒 Security Scan:
✓ No hardcoded secrets detected
✓ No SQL injection risks detected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Dependencies
```
google-adk>=0.1.0
python-dotenv>=1.0.0
openai>=1.0.0
```

---

## Notes
- All agents in single file for simplicity
- Uses OpenAI as LLM provider (configurable)
- `.env` file required for API key security
