from flask import Flask, request, jsonify
import html
import os
import re
from difflib import SequenceMatcher
from urllib.parse import quote
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

GENIUS_TOKEN = os.getenv('GENIUS_TOKEN', '').strip()

if not GENIUS_TOKEN:
    app.logger.warning('GENIUS_TOKEN is not set in server/.env')


def _normalize(text):
    cleaned = re.sub(r'[^a-z0-9\s]', ' ', (text or '').lower())
    return re.sub(r'\s+', ' ', cleaned).strip()


def _title_variants(title):
    """Generate cleaned title variants for lyrics provider lookups."""
    raw = (title or '').strip()
    if not raw:
        return []

    variants = [raw]

    # Remove parentheses/brackets, e.g. "Judas (Live)".
    cleaned = re.sub(r'\s*[\(\[].*?[\)\]]\s*', ' ', raw).strip()
    if cleaned and cleaned not in variants:
        variants.append(cleaned)

    # Remove common suffixes after separators, e.g. "Song - Remastered".
    for sep in [' - ', ' | ', ' / ', ' – ']:
        if sep in raw:
            head = raw.split(sep, 1)[0].strip()
            if head and head not in variants:
                variants.append(head)

    return variants


def _artist_variants(artist):
    """Generate artist variants (handle featured/collab formats)."""
    raw = (artist or '').strip()
    if not raw:
        return []

    variants = [raw]
    lowered = raw.lower()

    for token in [' feat. ', ' ft. ', ' featuring ', ' & ', ' x ', ',', ';']:
        idx = lowered.find(token)
        if idx > 0:
            head = raw[:idx].strip()
            if head and head not in variants:
                variants.append(head)

    return variants


def _fetch_lyrics_from_genius_page(song_url):
    """Fallback lyrics extraction from Genius song page HTML."""
    if not song_url:
        return ''

    try:
        r = requests.get(song_url, timeout=10)
    except Exception as e:
        app.logger.warning(f'Genius page fetch failed for {song_url}: {e}')
        return ''

    if r.status_code != 200:
        app.logger.info(f'Genius page unavailable (status {r.status_code}) for {song_url}')
        return ''

    html_text = r.text or ''
    if not html_text:
        return ''

    # New Genius layout keeps lyrics in repeated containers.
    blocks = re.findall(r'<div[^>]*data-lyrics-container="true"[^>]*>(.*?)</div>', html_text, flags=re.DOTALL | re.IGNORECASE)
    if not blocks:
        return ''

    lines = []
    for block in blocks:
        block = re.sub(r'<br\s*/?>', '\n', block, flags=re.IGNORECASE)
        block = re.sub(r'<[^>]+>', '', block)
        text = html.unescape(block).strip()
        if text:
            lines.append(text)

    combined = '\n'.join(lines).strip()
    if combined:
        app.logger.info(f'✓ Extracted lyrics from Genius page ({len(combined)} chars)')
    return combined


def _fetch_lyrics_from_lrclib(artist, title):
    """Fallback lyrics fetch from lrclib.net (free, no key)."""
    if not artist or not title:
        return ''

    url = 'https://lrclib.net/api/get'
    try:
        r = requests.get(
            url,
            params={
                'artist_name': artist,
                'track_name': title,
            },
            timeout=10,
        )
    except Exception as e:
        app.logger.warning(f'lrclib fetch failed for {artist} - {title}: {e}')
        return ''

    if r.status_code != 200:
        app.logger.info(f'lrclib not found (status {r.status_code}) for {artist} - {title}')
        return ''

    try:
        data = r.json()
    except Exception as e:
        app.logger.warning(f'lrclib parse error for {artist} - {title}: {e}')
        return ''

    lyrics = (data.get('plainLyrics') or '').strip()
    if lyrics:
        app.logger.info(f'✓ Found lyrics from lrclib for {artist} - {title} ({len(lyrics)} chars)')
    return lyrics


def _fetch_lyrics(artist, title, song_url=''):
    """Best-effort free lyrics fetch from lyrics.ovh."""
    if not artist or not title:
        return ''

    for artist_name in _artist_variants(artist):
        for song_title in _title_variants(title):
            url = f"https://api.lyrics.ovh/v1/{quote(artist_name, safe='')}/{quote(song_title, safe='')}"
            try:
                r = requests.get(url, timeout=8)
            except Exception as e:
                app.logger.warning(f'Lyrics fetch timeout/error for {artist_name} - {song_title}: {e}')
                continue

            if r.status_code != 200:
                app.logger.info(f'Lyrics not found (status {r.status_code}) for {artist_name} - {song_title}')
                continue

            try:
                data = r.json()
            except Exception as e:
                app.logger.warning(f'Lyrics parse error for {artist_name} - {song_title}: {e}')
                continue

            lyrics = (data.get('lyrics') or '').strip()
            if lyrics:
                app.logger.info(f'✓ Found lyrics for {artist_name} - {song_title} ({len(lyrics)} chars)')
                return lyrics

    for artist_name in _artist_variants(artist):
        for song_title in _title_variants(title):
            lyrics = _fetch_lyrics_from_lrclib(artist_name, song_title)
            if lyrics:
                return lyrics

    # Fallback source when lyrics.ovh does not have this track.
    return _fetch_lyrics_from_genius_page(song_url)


def _best_lyric_match(query, lyrics):
    """Return best matching line and score (0.0-1.0)."""
    q_norm = _normalize(query)
    if not q_norm or not lyrics:
        return '', 0.0

    q_tokens = set(q_norm.split())
    best_line = ''
    best_score = 0.0

    lines = [line.strip() for line in lyrics.splitlines() if line and line.strip()]

    # Compare both single lines and short multi-line windows to handle pasted snippets.
    candidates = []
    for idx, line in enumerate(lines[:600]):
        candidates.append(line)

        if idx + 1 < len(lines):
            candidates.append(f"{line} {lines[idx + 1]}")

        if idx + 2 < len(lines):
            candidates.append(f"{line} {lines[idx + 1]} {lines[idx + 2]}")

    for candidate in candidates:
        cand_norm = _normalize(candidate)
        if not cand_norm:
            continue

        cand_tokens = set(cand_norm.split())
        overlap_score = 0.0
        if q_tokens:
            overlap_score = len(q_tokens & cand_tokens) / len(q_tokens)

        seq_score = SequenceMatcher(None, q_norm, cand_norm).ratio()
        score = max(overlap_score, seq_score * 0.85)

        if q_norm in cand_norm or cand_norm in q_norm:
            score = max(score, 0.98)

        # Keep first non-empty candidate as fallback even when score is 0.0.
        if score > best_score or (best_line == '' and score >= best_score):
            best_score = score
            best_line = candidate

    if best_line:
        app.logger.info(f'Best match (score {best_score:.2f}): "{best_line[:60]}..."')

    return best_line, round(float(best_score), 3)


@app.route('/api/search', methods=['GET'])
def search():
    """Search songs via Genius, then rank with lyric-line similarity."""
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
    hits = ((data.get('response') or {}).get('hits') or [])[:8]

    mapped = []
    for hit in hits:
        result = hit.get('result') or {}
        primary_artist = result.get('primary_artist') or {}
        album = result.get('album') or {}

        title = result.get('title') or ''
        artist = primary_artist.get('name') or ''

        lyrics = _fetch_lyrics(artist, title, result.get('url') or '')
        matched_line, match_score = _best_lyric_match(q, lyrics)

        mapped.append({
            'id': str(result.get('id') or ''),
            'title': title,
            'artist': artist,
            'album': album.get('name') or '',
            'image': result.get('song_art_image_thumbnail_url') or result.get('song_art_image_url') or '',
            'url': result.get('url') or '',
            'lyrics': matched_line,
            'matchScore': match_score,
        })

    mapped.sort(key=lambda item: item.get('matchScore', 0.0), reverse=True)

    return jsonify({'results': mapped, 'total': len(mapped)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)
