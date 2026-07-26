from pathlib import Path
from datetime import datetime
import html
import re

INPUT_FILE = Path("AI_Report.md")
OUTPUT_FILE = Path("AI_Report.html")


def markdown_to_html(markdown_text: str) -> str:
    lines = markdown_text.splitlines()
    output = []
    in_code_block = False
    code_lines = []

    for line in lines:
        stripped = line.strip()

        if stripped.startswith("```"):
            if not in_code_block:
                in_code_block = True
                code_lines = []
            else:
                code_content = html.escape("\n".join(code_lines))
                output.append(f"<pre><code>{code_content}</code></pre>")
                in_code_block = False
            continue

        if in_code_block:
            code_lines.append(line)
            continue

        escaped = html.escape(line)

        # Basic markdown formatting
        escaped = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", escaped)
        escaped = re.sub(r"`(.*?)`", r"<code class='inline-code'>\1</code>", escaped)

        if stripped.startswith("# "):
            output.append(f"<h1>{escaped[2:]}</h1>")
        elif stripped.startswith("## "):
            output.append(f"<h2>{escaped[3:]}</h2>")
        elif stripped.startswith("### "):
            output.append(f"<h3>{escaped[4:]}</h3>")
        elif stripped.startswith("- "):
            output.append(f"<div class='list-item'>• {escaped[2:]}</div>")
        elif re.match(r"^\d+\.\s", stripped):
            output.append(f"<div class='list-item'>{escaped}</div>")
        elif stripped == "":
            output.append("<div class='spacing'></div>")
        else:
            css_class = ""

            lower = stripped.lower()

            if "critical" in lower:
                css_class = "critical"
            elif "high" in lower:
                css_class = "high"
            elif "medium" in lower:
                css_class = "medium"
            elif "low" in lower:
                css_class = "low"
            elif "recommendation" in lower or "suggestion" in lower:
                css_class = "recommendation"

            output.append(f"<p class='{css_class}'>{escaped}</p>")

    return "\n".join(output)


def generate_report() -> None:
    if not INPUT_FILE.exists():
        raise FileNotFoundError(f"{INPUT_FILE} not found")

    markdown_content = INPUT_FILE.read_text(encoding="utf-8")
    report_content = markdown_to_html(markdown_content)

    generated_time = datetime.now().strftime("%d %B %Y, %I:%M %p")

    html_document = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>AI Security Advisor Report</title>

    <style>
        * {{
            box-sizing: border-box;
        }}

        body {{
            margin: 0;
            padding: 30px;
            background: #eef2f7;
            font-family: Arial, Helvetica, sans-serif;
            color: #1f2937;
            line-height: 1.65;
        }}

        .report-container {{
            max-width: 1000px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 12px 35px rgba(15, 23, 42, 0.12);
        }}

        .header {{
            padding: 38px;
            color: white;
            background: linear-gradient(135deg, #172554, #1d4ed8, #0891b2);
        }}

        .header h1 {{
            margin: 0 0 8px 0;
            color: white;
            border: none;
            font-size: 32px;
        }}

        .header p {{
            margin: 5px 0;
            color: #dbeafe;
        }}

        .status-badge {{
            display: inline-block;
            margin-top: 16px;
            padding: 8px 16px;
            border-radius: 30px;
            background: rgba(255, 255, 255, 0.18);
            border: 1px solid rgba(255, 255, 255, 0.35);
            font-weight: bold;
        }}

        .content {{
            padding: 35px 42px;
        }}

        h1 {{
            color: #172554;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
        }}

        h2 {{
            margin-top: 32px;
            padding: 12px 16px;
            color: #1e3a8a;
            background: #eff6ff;
            border-left: 5px solid #2563eb;
            border-radius: 6px;
        }}

        h3 {{
            margin-top: 25px;
            color: #0f766e;
        }}

        p {{
            padding: 8px 12px;
            margin: 7px 0;
            border-radius: 6px;
        }}

        .critical {{
            color: #991b1b;
            background: #fee2e2;
            border-left: 5px solid #dc2626;
            font-weight: 600;
        }}

        .high {{
            color: #9a3412;
            background: #ffedd5;
            border-left: 5px solid #f97316;
        }}

        .medium {{
            color: #854d0e;
            background: #fef9c3;
            border-left: 5px solid #eab308;
        }}

        .low {{
            color: #166534;
            background: #dcfce7;
            border-left: 5px solid #22c55e;
        }}

        .recommendation {{
            color: #075985;
            background: #e0f2fe;
            border-left: 5px solid #0284c7;
        }}

        .list-item {{
            margin: 7px 0;
            padding: 9px 14px;
            background: #f8fafc;
            border-left: 4px solid #64748b;
            border-radius: 5px;
        }}

        pre {{
            padding: 18px;
            overflow-x: auto;
            color: #e2e8f0;
            background: #0f172a;
            border-radius: 8px;
            font-family: Consolas, monospace;
        }}

        .inline-code {{
            padding: 2px 6px;
            color: #be123c;
            background: #fce7f3;
            border-radius: 4px;
        }}

        .spacing {{
            height: 8px;
        }}

        .footer {{
            padding: 20px;
            text-align: center;
            color: #64748b;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
        }}
    </style>
</head>

<body>
    <div class="report-container">

        <div class="header">
            <h1>🛡️ AI Security Advisor Report</h1>
            <p>Wanderlust DevSecOps CI/CD Pipeline</p>
            <p>Generated: {generated_time}</p>
            <div class="status-badge">AI-Powered Security Analysis</div>
        </div>

        <div class="content">
            {report_content}
        </div>

        <div class="footer">
            Generated automatically by Jenkins, Trivy and Gemini AI
        </div>

    </div>
</body>
</html>
"""

    OUTPUT_FILE.write_text(html_document, encoding="utf-8")
    print(f"HTML report generated successfully: {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_report()
