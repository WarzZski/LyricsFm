import React, { createContext, useContext, useState } from 'react';

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  const [savedSongs, setSavedSongs] = useState([]);

  const addSong = (song) => {
    setSavedSongs(prev => {
      if (prev.find(s => s.id === song.id)) return prev;
      return [song, ...prev];
    });
  };

  const removeSong = (id) => {
    setSavedSongs(prev => prev.filter(s => s.id !== id));
  };

  return (
    <VaultContext.Provider value={{ savedSongs, addSong, removeSong }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  return useContext(VaultContext);
}

export default VaultContext;
