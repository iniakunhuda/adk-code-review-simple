#!/usr/bin/env python3
"""
Code Review Assistant - Multi-Agent System using Google ADK

An autonomous code analyzer with multi-repository context that:
- Reviews code changes
- Analyzes code quality
- Detects potential security issues
- Generates analysis reports
"""

import os
from google.adk.agents import LoopAgent
from google.adk.agents.llm_agent import Agent
from google.adk.models.lite_llm import LiteLlm

# Configuration from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gpt-4o-mini")

# Create LiteLLM model for OpenAI
llm = LiteLlm(model=DEFAULT_MODEL)


# ============================================================================
# TOOLS
# ============================================================================

def read_file_content(file_path: str) -> dict:
    """Read and return file content with metadata."""
    from pathlib import Path

    path = Path(file_path)

    if not path.exists():
        return {"status": "error", "message": f"File not found: {file_path}"}

    if not path.is_file():
        return {"status": "error", "message": f"Path is not a file: {file_path}"}

    # Detect language from extension
    extension = path.suffix.lower()
    language_map = {
        ".py": "Python",
        ".js": "JavaScript",
        ".ts": "TypeScript",
        ".jsx": "React (JSX)",
        ".tsx": "React (TSX)",
        ".go": "Go",
        ".rs": "Rust",
        ".java": "Java",
        ".kt": "Kotlin",
        ".cpp": "C++",
        ".c": "C",
        ".cs": "C#",
        ".php": "PHP",
        ".rb": "Ruby",
        ".swift": "Swift",
    }

    language = language_map.get(extension, "Unknown")

    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        return {
            "status": "success",
            "file_path": str(path),
            "language": language,
            "line_count": len(content.splitlines()),
            "char_count": len(content),
            "content": content,
        }
    except Exception as e:
        return {"status": "error", "message": f"Error reading file: {str(e)}"}


# ============================================================================
# SUB-AGENTS
# ============================================================================

code_reviewer = Agent(
    name="code_reviewer",
    model=llm,
    description=(
        "A code reviewer who analyzes code changes, checks for best practices, "
        "design patterns, and suggests improvements."
    ),
    instruction="""You are a Code Reviewer Agent.

Your role is to review the provided code and provide feedback on:

1. **Code Structure & Design**
   - Proper separation of concerns
   - Design patterns usage
   - Code organization

2. **Best Practices**
   - Language-specific conventions (PEP 8 for Python, etc.)
   - Naming conventions
   - Code readability

3. **Potential Issues**
   - Logic errors
   - Edge cases not handled
   - Performance concerns

Format your response as a structured report with:
- ✅ for things done well
- ⚠️ for warnings/suggestions
- ❌ for issues that should be fixed

Be specific with line numbers when possible.
"""
)


quality_analyzer = Agent(
    name="quality_analyzer",
    model=llm,
    description=(
        "A quality analyst who measures code quality metrics including "
        "complexity, maintainability, and technical debt indicators."
    ),
    instruction="""You are a Quality Analyzer Agent.

Your role is to analyze code quality and provide metrics on:

1. **Complexity Metrics**
   - Cyclomatic complexity
   - Nesting depth
   - Function/class length

2. **Maintainability**
   - Code duplication
   - Modularity
   - Test coverage indicators

3. **Technical Debt**
   - Code smells
   - Anti-patterns
   - TODO/FIXME comments

Provide your analysis with:
- Numerical scores where applicable
- Severity levels (Low/Medium/High)
- Actionable recommendations
"""
)


security_scanner = Agent(
    name="security_scanner",
    model=llm,
    description=(
        "A security analyst who scans code for potential vulnerabilities "
        "and security issues."
    ),
    instruction="""You are a Security Scanner Agent.

Your role is to scan code for security vulnerabilities including:

1. **Injection Vulnerabilities**
   - SQL injection
   - Command injection
   - Code injection

2. **Data Exposure**
   - Hardcoded secrets/credentials
   - Sensitive data logging
   - Insecure data handling

3. **Common Vulnerabilities**
   - XSS (Cross-site scripting)
   - CSRF (Cross-site request forgery)
   - Path traversal
   - Insecure dependencies

4. **Authentication/Authorization**
   - Missing authentication checks
   - Weak password handling
   - Session management issues

Format your response with:
- 🔒 for secure practices
- ⚠️ for potential vulnerabilities
- 🚨 for critical security issues
Include severity levels and remediation steps.
"""
)

# ============================================================================
# LOOP AGENT WORKFLOW (OPTIONAL) - IF WANT
# ============================================================================

# loop_agent = LoopAgent(
#     name="code_review_workflow_agent",
#     description="Orchestrates the code review workflow using sub-agents.",
#     sub_agents=[
#         code_reviewer,
#         quality_analyzer,
#         security_scanner,
#     ],
#     max_iterations=1
# )
# root_agent = loop_agent

# ============================================================================
# ROOT AGENT (COORDINATOR) - REQUIRED FOR ADK DISCOVERY
# ============================================================================

root_agent = Agent(
    name="code_review_coordinator",
    model=llm,
    description=(
        "Code Review Assistant: An autonomous multi-agent system that reviews code, "
        "analyzes quality, and scans for security vulnerabilities. "
        "Provide a file path to get a comprehensive code analysis report."
    ),
    instruction="""You are the Code Review Coordinator, a multi-agent system for comprehensive code analysis.

When a user provides a file path or code snippet:

1. **First**: Use the `read_file_content` tool if a file path is provided
2. **Then**: Coordinate with your specialist sub-agents:
   - code_reviewer: For best practices, design patterns, and code structure
   - quality_analyzer: For complexity, maintainability, and technical debt
   - security_scanner: For vulnerabilities and security issues
3. **Finally**: Compile their findings into a comprehensive report

## Report Format:

```markdown
# 🔍 Code Review Report

## 📁 File: [filename]
**Language:** [language] | **Lines:** [count] | **Chars:** [count]

---

## 📊 Code Review
[Code reviewer findings]

## 📈 Quality Analysis
[Quality analyzer findings]

## 🔒 Security Scan
[Security scanner findings]

---

## 📝 Summary
**Overall Assessment:** [Excellent/Good/Fair/Poor]

**Priority Items:**
1. [Most critical issues]

**Recommendation:** [Approve / Needs Changes / Reject]
```

Be thorough but concise. Focus on actionable insights.
""",
    tools=[
        read_file_content
    ],
    sub_agents=[
        code_reviewer,
        quality_analyzer,
        security_scanner,
    ]
)
