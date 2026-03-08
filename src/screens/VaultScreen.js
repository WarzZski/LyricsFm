import React from 'react';
import { useVault } from '../context/VaultContext';

export default function VaultScreen({ onViewDetails }){
  const { savedSongs, removeSong } = useVault();

  return (
    <div className="fluid">
      <h4>Songs you've identified:</h4>
      <div className="list">
        {savedSongs.length === 0 && <div style={{color:'#666'}}>No saved songs yet.</div>}
        {savedSongs.map(s => (
          <div key={s.id} className="song-row">
            <img src={s.image || 'https://via.placeholder.com/150'} alt="cover" />
            <div className="song-meta">
              <div className="title">{s.title}</div>
              <div className="artist">{s.artist}</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              <button className="btn" onClick={()=>onViewDetails && onViewDetails(s)}>View</button>
              <button className="btn" onClick={()=>removeSong(s.id)}>Remove ❌</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
