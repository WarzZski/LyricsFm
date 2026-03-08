import React from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SongCard } from '@/components/song-card';
import { useAppState } from '@/context/app-state-context';
import type { Song } from '@/types/song';

const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Bad Romance',
    artist: 'Lady Gaga',
    album: 'The Fame Monster',
    image: 'https://via.placeholder.com/300x300?text=Bad+Romance',
    lyrics: 'I want your ugly, I want your disease',
  },
  {
    id: '2',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    image: 'https://via.placeholder.com/300x300?text=Bohemian+Rhapsody',
    lyrics: 'Is this the real life? Is this just fantasy?',
  },
];

const API_BASE = Platform.select({
  android: 'http://192.168.1.5:5000',
  default: 'http://192.168.1.5:5000',
});

export default function SearchTabScreen() {
  const { query, setQuery, results, setResults, searching, setSearching, setSelectedSong } = useAppState();

  const openDetails = (song: Song) => {
    setSelectedSong(song);
    router.push('/song-details');
  };

  const fetchResults = async (q: string) => {
    if (!q || q.trim().length === 0) return;

    setSearching(true);
    try {
      const url = `${API_BASE}/api/search?q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && Array.isArray(data.results) && data.results.length > 0) {
        setResults(data.results as Song[]);
        return;
      }

      const lower = q.toLowerCase();
      const filtered = MOCK_SONGS.filter(
        (s) =>
          s.title.toLowerCase().includes(lower) ||
          s.artist.toLowerCase().includes(lower) ||
          (s.lyrics || '').toLowerCase().includes(lower)
      );
      setResults(filtered);
    } catch (error) {
      console.error('Search error', error);
      Alert.alert(
        'Search failed',
        'Could not reach your API server. If you are using a real phone, replace localhost with your PC LAN IP in app/(tabs)/index.tsx.'
      );
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.panel}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder='Type a lyric you remember...'
          placeholderTextColor='#9c9187'
        />
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.primary]} onPress={() => fetchResults(query)} disabled={searching}>
          {searching ? <ActivityIndicator color='#fff' /> : <Text style={styles.primaryText}>Search Lyrics</Text>}
        </Pressable>
        <Pressable
          style={styles.btn}
          onPress={() => {
            setQuery('');
            setResults([]);
          }}>
          <Text style={styles.btnText}>Clear</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Results</Text>
      {results.length === 0 && (
        <Text style={styles.emptyState}>No results yet. Try: caught in a bad romance</Text>
      )}
      {results.map((song) => (
        <SongCard key={song.id} song={song} onView={openDetails} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: '#fff9f0',
    minHeight: '100%',
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d4c6b9',
    padding: 10,
  },
  input: {
    fontSize: 15,
    color: '#1f1a17',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#d4c6b9',
    backgroundColor: '#fff',
  },
  primary: {
    backgroundColor: '#ef5a2f',
    borderColor: '#ef5a2f',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  btnText: {
    color: '#1f1a17',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1a17',
    marginBottom: 8,
  },
  emptyState: {
    color: '#6f665f',
    marginBottom: 10,
  },
});
