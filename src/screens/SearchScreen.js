import React from 'react';
import SongItem from '../components/SongItem';

// Mock data to demonstrate UI. Replace with real API fetch in fetchResults().
const MOCK_SONGS = [
  { id: '1', title: 'Bad Romance', artist: 'Lady Gaga', album: 'The Fame Monster', image: 'https://via.placeholder.com/300x300?text=Bad+Romance', lyrics: "I want your ugly, I want your disease" },
  { id: '2', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', image: 'https://via.placeholder.com/300x300?text=Bohemian+Rhapsody', lyrics: "Is this the real life? Is this just fantasy?" },
  { id: '3', title: 'Romance', artist: 'Ex Battalion', album: 'Single', image: 'https://via.placeholder.com/300x300?text=Romance', lyrics: "caught in a bad romance" }
];

export default function SearchScreen({ onViewDetails, query, setQuery, results, setResults, searching, setSearching }){

  const fetchResults = async (q) => {
    if (!q || q.trim().length === 0) return;
    setSearching(true);
    try {
      // Primary: call server search endpoint backed by Genius API
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data && Array.isArray(data.results) && data.results.length > 0) {
        setResults(data.results);
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
      <div className="search-panel">
        <input
          className="query-input"
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder={'Type a lyric you remember... (e.g., "caught in a bad romance")'}
        />
      </div>
      <div className="action-row">
        <button className="btn primary" onClick={()=>fetchResults(query)} disabled={searching}>Search Lyrics</button>
        <button className="btn" onClick={()=>{ setQuery(''); setResults([]); }}>Clear</button>
      </div>

      <div>
        <h4 className="section-title">Results</h4>
        <div className="list">
          {results.length===0 && <div className="empty-state">No results yet. Try searching sample: <em>caught in a bad romance</em></div>}
          {results.map(s => (
            <SongItem key={s.id} song={s} onView={onViewDetails} />
          ))}
        </div>
      </div>
    </div>
  )
}
