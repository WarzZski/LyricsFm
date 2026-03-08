import React from 'react';
import { useVault } from '../context/VaultContext';

export default function VaultScreen({ onViewDetails }){
  const { savedSongs, removeSong } = useVault();

  return (
    <div className="fluid">
      <h4 className="section-title">Songs You've Identified</h4>
      <div className="list">
        {savedSongs.length === 0 && <div className="empty-state">No saved songs yet.</div>}
        {savedSongs.map(s => (
          <div key={s.id} className="song-row">
            <img src={s.image || 'https://via.placeholder.com/150'} alt="cover" />
            <div className="song-meta">
              <div className="title">{s.title}</div>
              <div className="artist">{s.artist}</div>
            </div>
            <div className="song-actions">
              <button className="btn" onClick={()=>onViewDetails && onViewDetails(s)}>View</button>
              <button className="btn" onClick={()=>removeSong(s.id)}>Remove ❌</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
