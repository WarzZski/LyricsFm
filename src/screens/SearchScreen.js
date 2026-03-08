import React, {useState} from 'react';
import SongItem from '../components/SongItem';

// Mock data to demonstrate UI. Replace with real API fetch in fetchResults().
const MOCK_SONGS = [
  { id: '1', title: 'Bad Romance', artist: 'Lady Gaga', album: 'The Fame Monster', image: 'https://via.placeholder.com/300x300?text=Bad+Romance', lyrics: "I want your ugly, I want your disease" },
  { id: '2', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', image: 'https://via.placeholder.com/300x300?text=Bohemian+Rhapsody', lyrics: "Is this the real life? Is this just fantasy?" },
  { id: '3', title: 'Romance', artist: 'Ex Battalion', album: 'Single', image: 'https://via.placeholder.com/300x300?text=Romance', lyrics: "caught in a bad romance" }
];

export default function SearchScreen({ onViewDetails }){
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchResults = async (q) => {
    if (!q || q.trim().length === 0) return;
    setSearching(true);
    const geniusToken = process.env.REACT_APP_GENIUS_TOKEN;
    const musixKey = process.env.REACT_APP_MUSIXMATCH_KEY;

    try {
      // 1) Try Genius API if token provided (returns search hits)
      if (geniusToken) {
        const url = `https://api.genius.com/search?q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${geniusToken}` } });
        const data = await res.json();
        if (data && data.response && data.response.hits) {
          const mapped = data.response.hits.map(h => ({
            id: String(h.result.id),
            title: h.result.title,
            artist: h.result.primary_artist && h.result.primary_artist.name,
            image: h.result.song_art_image_thumbnail_url,
            album: h.result.album && h.result.album.name,
            // Genius doesn't provide lyrics via API; leave lyrics blank
            lyrics: ''
          }));
          setResults(mapped);
          setSearching(false);
          return;
        }
      }

      // 2) Try Musixmatch if API key provided (supports q_lyrics search)
      if (musixKey) {
        const url = `https://api.musixmatch.com/ws/1.1/track.search?q_lyrics=${encodeURIComponent(q)}&s_track_rating=desc&f_has_lyrics=1&page_size=10&apikey=${musixKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.message && data.message.body && data.message.body.track_list) {
          const mapped = data.message.body.track_list.map(item => {
            const t = item.track;
            return {
              id: String(t.track_id),
              title: t.track_name,
              artist: t.artist_name,
              album: t.album_name,
              image: t.album_coverart_100x100 || '',
              lyrics: ''
            };
          });
          setResults(mapped);
          setSearching(false);
          return;
        }
      }

      // 3) Fallback: local mock filtering
      const lower = q.toLowerCase();
      const filtered = MOCK_SONGS.filter(s => (
        s.title.toLowerCase().includes(lower) || s.artist.toLowerCase().includes(lower) || s.lyrics.toLowerCase().includes(lower)
      ));
      await new Promise(r => setTimeout(r, 300));
      setResults(filtered);
    } catch (err) {
      console.error('Search error', err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fluid">
      <div style={{marginBottom:12}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={'Type a lyric you remember... (e.g., "caught in a bad romance")'} style={{width:'100%', padding:10, borderRadius:8, border:'1px solid #ddd'}} />
      </div>
      <div style={{display:'flex', gap:8, marginBottom:12}}>
        <button className="btn primary" onClick={()=>fetchResults(query)} disabled={searching}>Search Lyrics</button>
        <button className="btn" onClick={()=>{ setQuery(''); setResults([]); }}>Clear</button>
      </div>

      <div>
        <h4>Results:</h4>
        <div className="list">
          {results.length===0 && <div style={{color:'#666'}}>No results yet. Try searching sample: <em>caught in a bad romance</em></div>}
          {results.map(s => (
            <SongItem key={s.id} song={s} onView={onViewDetails} />
          ))}
        </div>
      </div>
    </div>
  )
}
