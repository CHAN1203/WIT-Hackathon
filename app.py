from flask import Flask, request, jsonify, render_template
import requests
import os

app = Flask(__name__)

# Set your Perplexity API key here
API_KEY = "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"
URL = "https://api.perplexity.ai/chat/completions"

@app.route('/query', methods=['POST'])
def query_perplexity():
    data = request.get_json()
    user_query = data.get("query")
    
    if not user_query:
        return jsonify({"error": "Query is required"}), 400
    
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "system", "content": "Be precise and concise."},
            {"role": "user", "content": user_query}
        ],
        "max_tokens": 200,
        "temperature": 0.2,
        "top_p": 0.9,
        "return_images": False,
        "return_related_questions": False
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(URL, json=payload, headers=headers)
    return jsonify(response.json())

@app.route('/')
def home():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True)
