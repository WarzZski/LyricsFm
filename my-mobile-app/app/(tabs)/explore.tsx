import React from 'react';
import { router } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SongCard } from '@/components/song-card';
import { useAppState } from '@/context/app-state-context';
import type { Song } from '@/types/song';

export default function VaultTabScreen() {
  const { savedSongs, removeSong, setSelectedSong } = useAppState();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const openDetails = (song: Song) => {
    setSelectedSong(song);
    router.push('/song-details');
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 14, paddingBottom: tabBarHeight + insets.bottom + 16 },
      ]}>
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
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#fff9f0',
    minHeight: '100%',
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1f1a17',
    marginBottom: 12,
  },
  empty: {
    color: '#6f665f',
    fontSize: 15,
  },
  removeBtn: {
    borderWidth: 1,
    borderColor: '#d4c6b9',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginTop: 6,
  },
  removeText: {
    color: '#9e2a2b',
    fontSize: 13,
    fontWeight: '700',
  },
});
