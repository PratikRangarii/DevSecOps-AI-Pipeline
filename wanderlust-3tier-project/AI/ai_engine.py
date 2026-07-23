import os
import google.generativeai as genai
import ollama
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Read Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def ask_gemini(prompt):
    """
    Try Gemini first.
    """

    try:
        model = genai.GenerativeModel("gemini-3.6-flash")

        response = model.generate_content(prompt)

        return response.text

    except Exception as e:

        print("Gemini Failed:", e)

        return None


def ask_ollama(prompt):
    """
    Local AI using Ollama
    """

    try:

        response = ollama.chat(

            model="phi3:mini",

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response["message"]["content"]

    except Exception as e:

        return f"Ollama Failed : {e}"


def ask_ai(prompt):
    """
    Gemini -> Ollama fallback
    """

    result = ask_gemini(prompt)

    if result:

        print("Using Gemini API")

        return result

    print("Gemini unavailable...")
    print("Switching to Ollama...")

    return ask_ollama(prompt)
