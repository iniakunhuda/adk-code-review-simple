# 🔍 Code Review Assistant

An autonomous multi-agent system powered by Google ADK (Agent Development Kit) that automatically reviews code, analyzes quality, and scans for security vulnerabilities.

# Article

Please view this article to get know detail about implementation
https://iniakunhuda.medium.com/build-simple-ai-agent-using-google-adk-6e34b2564c7c

## 🌟 Features

- **Multi-Agent Architecture**: Specialized agents for different analysis tasks
- **Code Review**: Best practices, design patterns, and code structure analysis
- **Quality Analysis**: Complexity metrics, maintainability, and technical debt detection
- **Security Scanning**: SQL injection, XSS, hardcoded secrets, and vulnerability detection
- **Multi-Language Support**: Python, JavaScript, TypeScript, Go, PHP, Ruby, Swift, Java, Kotlin, C/C++, C#, Rust, and more

## 📋 Prerequisites

- Python 3.10 or later
- OpenAI API key
- pip for package installation

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure API Key

Edit `agent/.env` and add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
DEFAULT_MODEL=gpt-4o-mini
```

### 3. Run with ADK Web (Recommended)

```bash
# From project root (parent of agent/ folder)
adk web

# Open http://localhost:8000
# Select "code_review_coordinator" agent
```

### 4. Run with ADK CLI

```bash
adk run
```

## 📁 Project Structure

```
adk-code-review-simple/
├── agent/                    # Agent package
│   ├── __init__.py          # Exports root_agent
│   ├── agent.py             # Main multi-agent implementation
│   ├── .env                 # API configuration
│   └── .env.example         # Environment template
├── examples/                 # Vulnerable code examples for testing
│   ├── vulnerable_login.php
│   ├── vulnerable_api.go
│   └── vulnerable_app.js
├── .gitignore
├── planning.md              # Project planning document
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## 🏗️ Architecture

### Multi-Agent Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Request (File/Code)                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              code_review_coordinator (Root Agent)               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • Orchestrates the entire analysis workflow            │   │
│  │  • Uses read_file_content tool to load code            │   │
│  │  • Delegates tasks to specialist sub-agents            │   │
│  │  • Compiles findings into final report                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────┬──────────────┬──────────────┬──────────────┬────────────┘
       │              │              │              │
    Tool ────┐   Sub-Agent    Sub-Agent    Sub-Agent
       │      │       │              │              │
       ▼      │       ▼              ▼              ▼
┌──────────┐ │  ┌────────────┐ ┌──────────┐ ┌──────────────┐
│  read_   │ │  │   code_    │ │ quality_ │ │  security_   │
│  file_   │ │  │  reviewer  │ │ analyzer │ │   scanner    │
│ content  │ │  │            │ │          │ │              │
└──────────┘ │  └────────────┘ └──────────┘ └──────────────┘
             │  • Best       • Complexity • SQL Injection
             │    Practices   • Maintain • XSS
             │    • Design      ability  • Hardcoded
             │    • Structure  • Tech     Secrets
             │                  Debt      • Command
             │                            Injection
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Final Analysis Report                       │
│  📊 Code Review | 📈 Quality Analysis | 🔒 Security Scan      │
└─────────────────────────────────────────────────────────────────┘
```

### Workflow Flow

```
1. User Input → 2. Coordinator reads file → 3. Delegate to sub-agents
                                                    │
                    ┌───────────────────────────────┼───────────────────────┐
                    ▼                               ▼                       ▼
            ┌──────────────┐              ┌──────────────┐       ┌──────────────┐
            │ Code Review  │              │ Quality      │       │ Security     │
            │ Analysis     │              │ Analysis     │       │ Scan         │
            └──────────────┘              └──────────────┘       └──────────────┘
                    │                               │                       │
                    └───────────────┬───────────────┴───────────────────────┘
                                    ▼
                          4. Compile Final Report
                                    │
                                    ▼
                          5. Present to User

```

### Looping Flow (Optional LoopAgent)

```
                    ┌─────────────────────────────────────┐
                    │         User Request Input          │
                    └──────────────────┬──────────────────┘
                                       │
                                       ▼
                    ┌─────────────────────────────────────┐
                    │    LoopAgent (Workflow Orchestrator)│
                    │    • Manages iterative analysis     │
                    │    • Coordinates sub-agent loops    │
                    │    • max_iterations control         │
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
          ┌─────────────────┐                   ┌─────────────────┐
          │   Iteration 1   │                   │  Check Results  │
          │  • Analyze code │                   │  • Complete?    │
          │  • Find issues  │                   │  • Need more?   │
          └────────┬────────┘                   └────────┬────────┘
                   │                                     │
                   │    ┌────────────────────────────────┘
                   │    │ No
                   │    ▼
                   │  ┌─────────────────┐
                   │  │   Iteration N   │◄──────┐
                   │  │  • Refine       │       │
                   │  │  • Deep dive    │       │ Loop back
                   │  │  • Cross-check  │───────┘ for more
                   │  └────────┬────────┘       │ analysis
                   │           │                │
                   └───────────┴────────────────┘
                                       │ Yes
                                       ▼
                    ┌─────────────────────────────────────┐
                    │      Compile Final Report           │
                    │  • Aggregate all iterations         │
                    │  • Consolidate findings            │
                    │  • Generate recommendations        │
                    └──────────────────┬──────────────────┘
                                       │
                                       ▼
                    ┌─────────────────────────────────────┐
                    │        Present Final Output          │
                    └─────────────────────────────────────┘
```

**Note**: LoopAgent can be enabled in `agent/agent.py` by uncommenting the loop configuration:

```python
# Uncomment to enable iterative workflow
loop_agent = LoopAgent(
    name="code_review_workflow_agent",
    sub_agents=[code_reviewer, quality_analyzer, security_scanner],
    max_iterations=3  # Adjust iterations as needed
)
root_agent = loop_agent
```

### Agent Responsibilities

| Agent | Role |
|-------|------|
| **coordinator** | Orchestrates analysis, compiles reports |
| **code_reviewer** | Best practices, design patterns, code structure |
| **quality_analyzer** | Complexity, maintainability, technical debt |
| **security_scanner** | Vulnerabilities, hardcoded secrets, injection attacks |

## 💡 Usage Examples

### Review a Single File

```
Please review the file at examples/vulnerable_login.php
```

### Review Multiple Files

```
Review these files:
1. examples/vulnerable_api.go
2. examples/vulnerable_app.js
```

### Ask Specific Questions

```
What security issues are in examples/vulnerable_login.php?
```

## 📊 Sample Output

```markdown
# 🔍 Code Review Report

## 📁 File: vulnerable_login.php
**Language:** PHP | **Lines:** 64 | **Chars:** 1,234

---

## 📊 Code Review
⚠️ No input validation on user input (lines 29-30)
❌ Direct SQL query concatenation (line 18) - Use prepared statements
⚠️ Missing session regeneration after login

## 📈 Quality Analysis
- Cyclomatic Complexity: Low (Good)
- Code Duplication: None
- Technical Debt: Medium

## 🔒 Security Scan
🚨 **CRITICAL**: SQL Injection vulnerability (line 18)
🚨 **CRITICAL**: XSS vulnerability (lines 35-36, 44)
🚨 **HIGH**: Hardcoded database password (line 8)
🚨 **HIGH**: Command injection (line 56)
🚨 **HIGH**: Path traversal (line 61)
⚠️ **MEDIUM**: Password logging (line 40)

---

## 📝 Summary
**Overall Assessment:** Poor

**Priority Items:**
1. Fix SQL injection - use prepared statements
2. Fix XSS - sanitize all output
3. Remove hardcoded credentials from source

**Recommendation:** Reject
```

### Vulnerabilities Detected

| File | Vulnerabilities |
|------|-----------------|
| `vulnerable_login.php` | SQL Injection, XSS, Command Injection, Path Traversal, Hardcoded Secrets |
| `vulnerable_api.go` | SQL Injection, Command Injection, Path Traversal, SSRF, Insecure TLS |
| `vulnerable_app.js` | SQL Injection, XSS, SSRF, Command Injection, IDOR, Credit Card Logging |

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `DEFAULT_MODEL` | OpenAI model to use | `gpt-4o-mini` |

### Changing Models

Edit `agent/.env`:

```bash
# Use GPT-4o for better analysis
DEFAULT_MODEL=gpt-4o

# Use GPT-4o-mini for faster/cost-effective analysis
DEFAULT_MODEL=gpt-4o-mini
```

## 📦 Dependencies

```
google-adk>=0.1.0    # Google Agent Development Kit
python-dotenv>=1.0.0 # Environment variable management
openai>=1.0.0        # OpenAI API client
litellm>=0.1.0       # LiteLLM for multi-provider support
```

## 🔒 Security Note

**⚠️ DO NOT commit your `.env` file** - it contains sensitive API keys

## 📝 License

This project is provided as-is for educational and development purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📚 Resources

- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [LiteLLM Documentation](https://docs.litellm.ai/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

---

Built with ❤️ using [Google ADK](https://github.com/google/adk-python)
