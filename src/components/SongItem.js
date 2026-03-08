import React from 'react';

export default function SongItem({song, onView, rightAction}){
  const hasMatch = typeof song.matchScore === 'number' && song.matchScore > 0;

  return (
    <div className="song-row">
      <img src={song.image || 'https://via.placeholder.com/150'} alt="cover" />
      <div className="song-meta">
        <div className="title">{song.title}</div>
        <div className="artist">{song.artist}</div>
        {hasMatch && <div className="match-score">Match: {(song.matchScore * 100).toFixed(0)}%</div>}
        {!!song.lyrics && <div className="match-line">"{song.lyrics}"</div>}
      </div>
      <div className="song-actions">
        <button className="btn" onClick={() => onView && onView(song)}>View Details</button>
        {rightAction}
      </div>
    </div>
  )
}
