import React from 'react';
import { useVault } from '../context/VaultContext';

export default function DetailScreen({ song }){
  const { addSong } = useVault();

  if(!song) return <div>No song selected</div>;

  return (
    <div className="fluid">
      <div className="cover-wrap">
        <img className="cover-art" src={song.image || 'https://via.placeholder.com/400'} alt="cover" />
      </div>

      <div className="detail-card">
        <div className="detail-title">{song.title}</div>
        <div className="detail-subtitle">{song.artist}</div>
        <div className="detail-album">Album: {song.album || 'Unknown'}</div>

        <div className="detail-actions">
          <button className="btn primary" onClick={()=>addSong(song)}>❤️ SAVE TO MY VAULT</button>
        </div>

        <div className="matched-lyric">
          Matched Lyric:
          <div className="matched-quote">"...{(song.lyrics||'').slice(0,120)}..."</div>
        </div>
      </div>
    </div>
  )
}
