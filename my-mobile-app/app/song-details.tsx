import React from 'react';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState } from '@/context/app-state-context';

export default function SongDetailsScreen() {
  const { selectedSong, addSong } = useAppState();
  const insets = useSafeAreaInsets();

  if (!selectedSong) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No song selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 24 }]}>
      <View style={styles.headerBox}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Song Details</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>
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
    padding: 18,
    paddingTop: 0,
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
    borderRadius: 18,
    backgroundColor: '#ddd',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d4c6b9',
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1f1a17',
  },
  artist: {
    fontSize: 18,
    color: '#6f665f',
  },
  album: {
    marginTop: 4,
    fontSize: 16,
    color: '#1f1a17',
  },
  saveBtn: {
    marginTop: 10,
    backgroundColor: '#ef5a2f',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  matchedLabel: {
    marginTop: 12,
    fontStyle: 'italic',
    color: '#1f1a17',
    fontSize: 16,
  },
  matchedQuote: {
    color: '#6f665f',
    fontSize: 16,
  },
  confidence: {
    color: '#0d7f76',
    fontSize: 13,
    marginTop: 4,
  },
  headerBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: '#1f1a17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    borderWidth: 0,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#f0ede8',
    shadowColor: '#1f1a17',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f1a17',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#1f1a17',
  },
  headerSpacer: {
    width: 56,
  },
});
