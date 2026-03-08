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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#fff9f0',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1f1a17',
    marginBottom: 16,
  },
  empty: {
    color: '#8b7f79',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  removeBtn: {
    borderWidth: 0,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: '#fff0ed',
    marginTop: 8,
    shadowColor: '#9e2a2b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  removeText: {
    color: '#d84646',
    fontSize: 14,
    fontWeight: '700',
  },
});
