from flask import Flask, request, jsonify
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

GENIUS_TOKEN = os.getenv('GENIUS_TOKEN', '').strip()

if not GENIUS_TOKEN:
    app.logger.warning('GENIUS_TOKEN is not set in server/.env')


@app.route('/api/search', methods=['GET'])
def search():
    """Search songs from lyric or title query via Genius REST API."""
    q = (request.args.get('q') or '').strip()
    if not q:
        return jsonify({'error': 'missing query parameter q'}), 400

    if not GENIUS_TOKEN:
        return jsonify({'error': 'server not configured with GENIUS_TOKEN'}), 500

    try:
        r = requests.get(
            'https://api.genius.com/search',
            params={'q': q},
            headers={'Authorization': f'Bearer {GENIUS_TOKEN}'},
            timeout=15,
        )
    except Exception as e:
        return jsonify({'error': 'genius request failed', 'details': str(e)}), 502

    if r.status_code >= 400:
        try:
            return jsonify(r.json()), r.status_code
        except Exception:
            return jsonify({'error': 'genius error', 'status_code': r.status_code, 'text': r.text}), 502

    data = r.json()
    hits = ((data.get('response') or {}).get('hits') or [])

    mapped = []
    for hit in hits:
        result = hit.get('result') or {}
        primary_artist = result.get('primary_artist') or {}
        album = result.get('album') or {}
        mapped.append({
            'id': str(result.get('id') or ''),
            'title': result.get('title') or '',
            'artist': primary_artist.get('name') or '',
            'album': album.get('name') or '',
            'image': result.get('song_art_image_thumbnail_url') or result.get('song_art_image_url') or '',
            'url': result.get('url') or '',
        })

    return jsonify({'results': mapped, 'total': len(mapped)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)
