import React from 'react';
import { router } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const API_BASE_CANDIDATES = [
  // Public backend URL for APK/prod builds.
  process.env.EXPO_PUBLIC_API_BASE_URL,
  // Local fallbacks for development.
  ...(Platform.select({
    android: ['http://10.0.2.2:5000', 'http://192.168.1.5:5000'],
    default: ['http://localhost:5000', 'http://192.168.1.5:5000'],
  }) as string[]),
].filter((base): base is string => Boolean(base));

async function fetchFromApi(q: string): Promise<Song[] | null> {
  for (const base of API_BASE_CANDIDATES) {
    try {
      const url = `${base}/api/search?q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      if (data && Array.isArray(data.results) && data.results.length > 0) {
        return data.results as Song[];
      }
    } catch {
      // Try the next candidate host.
    }
  }

  return null;
}

export default function SearchTabScreen() {
  const { query, setQuery, results, setResults, searching, setSearching, setSelectedSong } = useAppState();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const openDetails = (song: Song) => {
    setSelectedSong(song);
    router.push('/song-details');
  };

  const fetchResults = async (q: string) => {
    if (!q || q.trim().length === 0) return;

    setSearching(true);
    try {
      const apiResults = await fetchFromApi(q);
      if (apiResults && apiResults.length > 0) {
        setResults(apiResults);
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
        'Could not reach API server. Make sure Flask is running. Emulator uses 10.0.2.2, while phones use your PC LAN IP.'
      );
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: tabBarHeight + 24 }]}>
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
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#fff9f0',
    minHeight: '100%',
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: '#1f1a17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    fontSize: 18,
    color: '#1f1a17',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    marginBottom: 20,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 0,
    backgroundColor: '#f0ede8',
    shadowColor: '#1f1a17',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primary: {
    backgroundColor: '#ef5a2f',
    shadowColor: '#ef5a2f',
    shadowOpacity: 0.12,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  btnText: {
    color: '#1f1a17',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#1f1a17',
    marginBottom: 14,
  },
  emptyState: {
    color: '#8b7f79',
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});
