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
    try {
      // Primary: call the server Gemini identify endpoint
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snippet: q })
      });
      const data = await res.json();

      // If model returned structured identification, map to results
      if (data && (data.title || data.artist || data.album || data.confidence !== undefined)) {
        const title = data.title || '';
        const artist = data.artist || '';
        const album = data.album || '';
        const confidence = data.confidence || 0;
        const mapped = [{
          id: `${title}:${artist}`,
          title,
          artist,
          album,
          image: '',
          lyrics: '',
          confidence
        }];
        setResults(mapped);
        return;
      }

      // Fallback: local mock filtering (when identify fails or returns raw text)
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
