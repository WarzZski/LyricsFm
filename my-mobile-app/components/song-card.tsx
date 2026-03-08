import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Song } from '@/types/song';

type SongCardProps = {
  song: Song;
  onView: (song: Song) => void;
  rightAction?: React.ReactNode;
};

export function SongCard({ song, onView, rightAction }: SongCardProps) {
  const hasMatch = typeof song.matchScore === 'number' && song.matchScore > 0;

  return (
    <View style={styles.row}>
      <Image source={{ uri: song.image || 'https://via.placeholder.com/150' }} style={styles.image} />
      <View style={styles.meta}>
        <Text style={styles.title}>{song.title}</Text>
        <Text style={styles.artist}>{song.artist}</Text>
        {hasMatch && <Text style={styles.score}>Match: {(song.matchScore! * 100).toFixed(0)}%</Text>}
        {!!song.lyrics && <Text style={styles.line}>"{song.lyrics}"</Text>}
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={() => onView(song)}>
          <Text style={styles.btnText}>View</Text>
        </Pressable>
        {rightAction}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d4c6b9',
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 10,
  },
  image: {
    width: 62,
    height: 62,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#1f1a17',
    fontSize: 15,
    fontWeight: '700',
  },
  artist: {
    color: '#6f665f',
    fontSize: 13,
  },
  score: {
    color: '#0d7f76',
    fontSize: 12,
    marginTop: 2,
  },
  line: {
    color: '#6f665f',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  btn: {
    borderWidth: 1,
    borderColor: '#d4c6b9',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff9f0',
  },
  btnText: {
    color: '#1f1a17',
    fontSize: 12,
    fontWeight: '600',
  },
});
