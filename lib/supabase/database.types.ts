export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          avatar_url: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          avatar_url?: string | null
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          artist: string
          artist_id: string | null
          album_id: string | null
          url: string
          thumbnail: string
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          artist_id?: string | null
          album_id?: string | null
          url: string
          thumbnail: string
          duration: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          artist_id?: string | null
          album_id?: string | null
          url?: string
          thumbnail?: string
          duration?: number
          created_at?: string
        }
      }
      albums: {
        Row: {
          id: string
          title: string
          artist: string
          artist_id: string | null
          thumbnail: string
          release_year: number | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          artist_id?: string | null
          thumbnail: string
          release_year?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          artist_id?: string | null
          thumbnail?: string
          release_year?: number | null
          created_at?: string
        }
      }
      playlists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          thumbnail: string | null
          is_public: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          thumbnail?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          thumbnail?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      playlist_songs: {
        Row: {
          id: string
          playlist_id: string
          song_id: string
          added_at: string
          position: number
        }
        Insert: {
          id?: string
          playlist_id: string
          song_id: string
          added_at?: string
          position: number
        }
        Update: {
          id?: string
          playlist_id?: string
          song_id?: string
          added_at?: string
          position?: number
        }
      }
      recently_played: {
        Row: {
          id: string
          user_id: string
          song_id: string
          played_at: string
        }
        Insert: {
          id?: string
          user_id: string
          song_id: string
          played_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          song_id?: string
          played_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          name: string
          image_url: string | null
          bio: string | null
          followers_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url?: string | null
          bio?: string | null
          followers_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string | null
          bio?: string | null
          followers_count?: number
          created_at?: string
        }
      }
    }
    Views: {
      _: never
    }
    Functions: {
      _: never
    }
    Enums: {
      _: never
    }
  }
}
