from ai_engine import ask_ai

prompt = """
Analyze the following security log:

HIGH Vulnerability found in openssl package.
CRITICAL Vulnerability found in node package.

Give short security advice.
"""

response = ask_ai(prompt)

print("\n===== AI RESPONSE =====\n")
print(response)
