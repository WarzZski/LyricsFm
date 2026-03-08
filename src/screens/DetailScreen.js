import React from 'react';
import { useVault } from '../context/VaultContext';

export default function DetailScreen({ song }){
  const { addSong } = useVault();

  if(!song) return <div>No song selected</div>;

  return (
    <div className="fluid">
      <div style={{display:'flex', justifyContent:'center', marginBottom:12}}>
        <img src={song.image || 'https://via.placeholder.com/400'} alt="cover" style={{width:220, height:220, objectFit:'cover', borderRadius:8}} />
      </div>

      <div>
        <div style={{fontWeight:700, fontSize:18}}>{song.title}</div>
        <div style={{color:'#666'}}>{song.artist}</div>
        <div style={{color:'#666', marginTop:6}}>Album: {song.album}</div>

        <div style={{marginTop:12}}>
          <button className="btn primary" onClick={()=>addSong(song)}>❤️ SAVE TO MY VAULT</button>
        </div>

        <div className="matched-lyric">
          Matched Lyric:
          <div style={{marginTop:8}}>"...{(song.lyrics||'').slice(0,120)}..."</div>
        </div>
      </div>
    </div>
  )
}
