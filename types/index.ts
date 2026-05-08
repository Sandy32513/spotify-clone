export interface User {
  id: string;
  email: string;
  created_at: string;
  avatar_url?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artist_id?: string;
  album_id?: string;
  url: string;
  thumbnail: string;
  duration: number;
  created_at?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artist_id?: string;
  thumbnail: string;
  release_year?: number;
  created_at?: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
  songs?: Song[];
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  added_at: string;
  position: number;
}

export interface RecentlyPlayed {
  id: string;
  user_id: string;
  song_id: string;
  played_at: string;
}

export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  originalQueue: Song[];
}

export interface RealtimeEvent {
  type: 'play' | 'pause' | 'seek' | 'track_change' | 'queue_update';
  data: {
    songId?: string;
    position?: number;
    userId?: string;
    timestamp?: number;
    queue?: Song[];
  };
  roomId: string;
}

export interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: number;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

export interface SearchResult {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

export interface Artist {
  id: string;
  name: string;
  image_url?: string;
  followers_count?: number;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
}

export type RepeatMode = 'off' | 'all' | 'one';
export type ViewMode = 'home' | 'search' | 'library' | 'playlist' | 'album' | 'artist';
