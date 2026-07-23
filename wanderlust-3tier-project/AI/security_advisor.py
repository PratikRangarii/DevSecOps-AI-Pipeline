from read_reports import read_trivy_reports
from ai_engine import ask_ai

reports = read_trivy_reports()

prompt = f"""
You are a Senior DevSecOps Security Engineer.

Analyze the following Trivy reports.

Give:

1. Overall Security Score (0-100)
2. Critical Vulnerabilities
3. High Vulnerabilities
4. Most Dangerous Packages
5. Immediate Fixes
6. Best Practices
7. Executive Summary

Keep the report professional.

{reports}
"""

response = ask_ai(prompt)

with open("AI_Report.md", "w", encoding="utf-8") as f:
    f.write(response)

print(response)
