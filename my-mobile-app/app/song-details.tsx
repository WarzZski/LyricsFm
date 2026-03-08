import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppState } from '@/context/app-state-context';

export default function SongDetailsScreen() {
  const { selectedSong, addSong } = useAppState();

  if (!selectedSong) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No song selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: selectedSong.image || 'https://via.placeholder.com/400' }} style={styles.cover} />
      <View style={styles.card}>
        <Text style={styles.title}>{selectedSong.title}</Text>
        <Text style={styles.artist}>{selectedSong.artist}</Text>
        <Text style={styles.album}>Album: {selectedSong.album || 'Unknown'}</Text>

        <Pressable style={styles.saveBtn} onPress={() => addSong(selectedSong)}>
          <Text style={styles.saveText}>Save To My Vault</Text>
        </Pressable>

        <Text style={styles.matchedLabel}>Matched Lyric:</Text>
        <Text style={styles.matchedQuote}>
          {selectedSong.lyrics && selectedSong.lyrics.trim()
            ? `"${selectedSong.lyrics}"`
            : 'No lyric line match returned for this result.'}
        </Text>
        {typeof selectedSong.matchScore === 'number' && selectedSong.matchScore > 0 && (
          <Text style={styles.confidence}>Match confidence: {(selectedSong.matchScore * 100).toFixed(0)}%</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff9f0',
    minHeight: '100%',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff9f0',
  },
  empty: {
    color: '#6f665f',
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#ddd',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d4c6b9',
    padding: 14,
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f1a17',
  },
  artist: {
    fontSize: 16,
    color: '#6f665f',
  },
  album: {
    marginTop: 4,
    fontSize: 14,
    color: '#1f1a17',
  },
  saveBtn: {
    marginTop: 10,
    backgroundColor: '#ef5a2f',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
  matchedLabel: {
    marginTop: 12,
    fontStyle: 'italic',
    color: '#1f1a17',
  },
  matchedQuote: {
    color: '#6f665f',
    fontSize: 14,
  },
  confidence: {
    color: '#0d7f76',
    fontSize: 12,
    marginTop: 4,
  },
});
