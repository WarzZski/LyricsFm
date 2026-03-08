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
          <div className="matched-quote">
            {song.lyrics && song.lyrics.trim() ? `"${song.lyrics}"` : 'No lyric line match returned for this result.'}
          </div>
          {typeof song.matchScore === 'number' && song.matchScore > 0 && (
            <div className="match-confidence">Match confidence: {(song.matchScore * 100).toFixed(0)}%</div>
          )}
        </div>
      </div>
    </div>
  )
}
