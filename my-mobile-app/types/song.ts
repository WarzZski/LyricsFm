export type Song = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  image?: string;
  url?: string;
  lyrics?: string;
  matchScore?: number;
};
