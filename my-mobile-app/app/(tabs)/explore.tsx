import React from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SongCard } from '@/components/song-card';
import { useAppState } from '@/context/app-state-context';
import type { Song } from '@/types/song';

export default function VaultTabScreen() {
  const { savedSongs, removeSong, setSelectedSong } = useAppState();

  const openDetails = (song: Song) => {
    setSelectedSong(song);
    router.push('/song-details');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Songs You've Identified</Text>
      {savedSongs.length === 0 && <Text style={styles.empty}>No saved songs yet.</Text>}
      {savedSongs.map((song) => (
        <SongCard
          key={song.id}
          song={song}
          onView={openDetails}
          rightAction={
            <Pressable style={styles.removeBtn} onPress={() => removeSong(song.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          }
        />
      ))}
      <View style={{ height: 12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: '#fff9f0',
    minHeight: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f1a17',
    marginBottom: 10,
  },
  empty: {
    color: '#6f665f',
  },
  removeBtn: {
    borderWidth: 1,
    borderColor: '#d4c6b9',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginTop: 6,
  },
  removeText: {
    color: '#9e2a2b',
    fontSize: 12,
    fontWeight: '700',
  },
});
