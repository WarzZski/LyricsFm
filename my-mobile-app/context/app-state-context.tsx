import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Song } from '@/types/song';

type AppStateContextValue = {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  results: Song[];
  setResults: React.Dispatch<React.SetStateAction<Song[]>>;
  searching: boolean;
  setSearching: React.Dispatch<React.SetStateAction<boolean>>;
  savedSongs: Song[];
  addSong: (song: Song) => void;
  removeSong: (id: string) => void;
  selectedSong: Song | null;
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | null>>;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [searching, setSearching] = useState(false);
  const [savedSongs, setSavedSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const addSong = (song: Song) => {
    setSavedSongs((prev) => {
      if (prev.find((s) => s.id === song.id)) return prev;
      return [song, ...prev];
    });
  };

  const removeSong = (id: string) => {
    setSavedSongs((prev) => prev.filter((s) => s.id !== id));
  };

  const value = useMemo(
    () => ({
      query,
      setQuery,
      results,
      setResults,
      searching,
      setSearching,
      savedSongs,
      addSong,
      removeSong,
      selectedSong,
      setSelectedSong,
    }),
    [query, results, searching, savedSongs, selectedSong]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
