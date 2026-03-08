import React from 'react';

export default function SongItem({song, onView, rightAction}){
  return (
    <div className="song-row">
      <img src={song.image || 'https://via.placeholder.com/150'} alt="cover" />
      <div className="song-meta">
        <div className="title">{song.title}</div>
        <div className="artist">{song.artist}</div>
      </div>
      <div className="song-actions">
        <button className="btn" onClick={() => onView && onView(song)}>View Details</button>
        {rightAction}
      </div>
    </div>
  )
}
