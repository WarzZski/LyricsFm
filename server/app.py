from flask import Flask, request, jsonify
import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Gemini / Vertex AI settings (set these in server/.env)
PROJECT_ID = os.getenv('GCP_PROJECT')
LOCATION = os.getenv('GCP_LOCATION', 'us-central1')
MODEL = os.getenv('GEMINI_MODEL', 'text-bison-001')

if not PROJECT_ID:
    app.logger.warning('GCP_PROJECT not set — Gemini identify endpoint will not function until configured')


def _get_gcp_access_token():
    """Obtain an access token using Application Default Credentials."""
    try:
        import google.auth
        from google.auth.transport.requests import Request as GoogleRequest
        credentials, project = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
        credentials.refresh(GoogleRequest())
        return credentials.token
    except Exception as e:
        app.logger.error('Failed to get GCP access token: %s', e)
        return None


@app.route('/api/identify', methods=['POST'])
def identify():
    """Identify song from a lyric snippet using Gemini (Vertex AI).

    Expects JSON: { "snippet": "..." }
    Returns parsed JSON result or raw model text if parsing fails.
    """
    body = request.get_json() or {}
    snippet = body.get('snippet') or request.args.get('q')
    if not snippet:
        return jsonify({'error': 'missing snippet parameter'}), 400

    if not PROJECT_ID:
        return jsonify({'error': 'server not configured with GCP_PROJECT'}), 500

    token = _get_gcp_access_token()
    if not token:
        return jsonify({'error': 'unable to obtain GCP access token'}), 500

    prompt = (
        "Identify the song and artist for the lyric snippet below. Respond ONLY with valid JSON using the keys: title, artist, album, confidence. "
        "If unknown, set title and artist to empty strings and confidence to 0.0.\n\nSnippet:\n" + snippet
    )

    url = f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/{MODEL}:predict"
    payload = {
        "instances": [{"content": prompt}],
        "parameters": {"temperature": 0.0, "maxOutputTokens": 256}
    }

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    try:
        r = requests.post(url, headers=headers, json=payload, timeout=20)
        r.raise_for_status()
    except Exception as e:
        app.logger.error('Vertex AI request failed: %s', e)
        return jsonify({'error': 'vertex request failed', 'details': str(e)}), 502

    resp = r.json()
    # Extract model text output; different responses may vary
    try:
        preds = resp.get('predictions') or []
        if preds:
            text = preds[0].get('content') or preds[0]
        else:
            # older APIs may use 'outputs'
            outputs = resp.get('outputs') or []
            text = outputs[0].get('content') if outputs else json.dumps(resp)
    except Exception:
        text = json.dumps(resp)

    # Try parse JSON from model output
    parsed = None
    try:
        parsed = json.loads(text)
    except Exception:
        # attempt to extract JSON substring
        import re
        m = re.search(r'\{.*\}', text, re.S)
        if m:
            try:
                parsed = json.loads(m.group(0))
            except Exception:
                parsed = None

    if parsed:
        return jsonify(parsed)
    return jsonify({'raw': text, 'full_response': resp})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)
