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
          username: string | null
          display_name: string | null
          avatar_url: string | null
          default_role: Database["public"]["Enums"]["app_role"]
          is_active: boolean
          last_seen_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          default_role?: Database["public"]["Enums"]["app_role"]
          is_active?: boolean
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          default_role?: Database["public"]["Enums"]["app_role"]
          is_active?: boolean
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      roles: {
        Row: {
          id: string
          key: Database["public"]["Enums"]["app_role"]
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          key: Database["public"]["Enums"]["app_role"]
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          key?: Database["public"]["Enums"]["app_role"]
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      permissions: {
        Row: {
          id: string
          key: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          description?: string | null
          created_at?: string
        }
      }
      genres: {
        Row: {
          id: string
          name: string
          slug: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          created_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          name: string
          slug: string | null
          image_url: string | null
          bio: string | null
          followers_count: number
          verified: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          image_url?: string | null
          bio?: string | null
          followers_count?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          image_url?: string | null
          bio?: string | null
          followers_count?: number
          verified?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      albums: {
        Row: {
          id: string
          title: string
          slug: string | null
          artist_id: string | null
          artist: string
          thumbnail: string
          release_year: number | null
          release_date: string | null
          label: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug?: string | null
          artist_id?: string | null
          artist: string
          thumbnail?: string
          release_year?: number | null
          release_date?: string | null
          label?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string | null
          artist_id?: string | null
          artist?: string
          thumbnail?: string
          release_year?: number | null
          release_date?: string | null
          label?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          slug: string | null
          artist: string
          artist_id: string | null
          album_id: string | null
          url: string
          thumbnail: string
          duration: number
          track_number: number | null
          disc_number: number
          release_date: string | null
          status: Database["public"]["Enums"]["song_status"]
          is_explicit: boolean
          play_count: number
          like_count: number
          storage_file_id: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug?: string | null
          artist: string
          artist_id?: string | null
          album_id?: string | null
          url: string
          thumbnail?: string
          duration?: number
          track_number?: number | null
          disc_number?: number
          release_date?: string | null
          status?: Database["public"]["Enums"]["song_status"]
          is_explicit?: boolean
          play_count?: number
          like_count?: number
          storage_file_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string | null
          artist?: string
          artist_id?: string | null
          album_id?: string | null
          url?: string
          thumbnail?: string
          duration?: number
          track_number?: number | null
          disc_number?: number
          release_date?: string | null
          status?: Database["public"]["Enums"]["song_status"]
          is_explicit?: boolean
          play_count?: number
          like_count?: number
          storage_file_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
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
          visibility: Database["public"]["Enums"]["playlist_visibility"]
          is_collaborative: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          thumbnail?: string | null
          is_public?: boolean
          visibility?: Database["public"]["Enums"]["playlist_visibility"]
          is_collaborative?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          thumbnail?: string | null
          is_public?: boolean
          visibility?: Database["public"]["Enums"]["playlist_visibility"]
          is_collaborative?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      playlist_songs: {
        Row: {
          id: string
          playlist_id: string
          song_id: string
          added_by: string | null
          added_at: string
          position: number
        }
        Insert: {
          id?: string
          playlist_id: string
          song_id: string
          added_by?: string | null
          added_at?: string
          position: number
        }
        Update: {
          id?: string
          playlist_id?: string
          song_id?: string
          added_by?: string | null
          added_at?: string
          position?: number
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          song_id: string
          liked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          song_id: string
          liked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          song_id?: string
          liked_at?: string
        }
      }
      recently_played: {
        Row: {
          id: string
          user_id: string
          song_id: string
          played_at: string
          progress_seconds: number | null
          context: Json
        }
        Insert: {
          id?: string
          user_id: string
          song_id: string
          played_at?: string
          progress_seconds?: number | null
          context?: Json
        }
        Update: {
          id?: string
          user_id?: string
          song_id?: string
          played_at?: string
          progress_seconds?: number | null
          context?: Json
        }
      }
      playback_events: {
        Row: {
          id: string
          user_id: string | null
          song_id: string | null
          event_type: string
          position_seconds: number | null
          device_id: string | null
          room_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          song_id?: string | null
          event_type: string
          position_seconds?: number | null
          device_id?: string | null
          room_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          song_id?: string | null
          event_type?: string
          position_seconds?: number | null
          device_id?: string | null
          room_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      _: never
    }
    Functions: {
      search_catalog: {
        Args: {
          search_query: string
          result_limit?: number
        }
        Returns: {
          entity_type: string
          entity_id: string
          title: string
          subtitle: string
          image_url: string
          rank: number
        }[]
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "curator" | "listener"
      playlist_visibility: "private" | "public" | "unlisted"
      song_status: "draft" | "processing" | "published" | "archived" | "rejected"
      asset_status: "discovered" | "queued" | "validating" | "valid" | "corrupted" | "duplicate" | "uploaded" | "failed" | "skipped"
      upload_status: "queued" | "processing" | "completed" | "failed" | "cancelled" | "partial"
      storage_file_kind: "audio" | "archive" | "extracted" | "artwork" | "report" | "log" | "temp" | "other"
    }
  }
}