'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import SongCard from '@/components/SongCard';
import { getPlaylistById, updatePlaylist } from '@/lib/supabase/queries';
import { usePlayerStore } from '@/store/playerStore';
import type { Playlist, Song } from '@/types';

export default function PlaylistPage() {
  const params = useParams();
  const playlistId = params.id as string;

  const { playSong } = usePlayerStore();
  const [playlist, setPlaylist] = useState<(Playlist & { songs: Song[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [currentPlaylistId, setCurrentPlaylistId] = useState(playlistId);

  useEffect(() => {
    setCurrentPlaylistId(playlistId);
  }, [playlistId]);

  useEffect(() => {
    if (!currentPlaylistId) return;

    const loadPlaylist = async () => {
      setLoading(true);
      const { data, error } = await getPlaylistById(currentPlaylistId);
      if (data && !error) {
        setPlaylist(data);
        setEditName(data.name);
        setEditDescription(data.description || '');
      }
      setLoading(false);
    };

    loadPlaylist();
  }, [currentPlaylistId]);

  const handlePlayAll = () => {
    if (playlist?.songs.length) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleSaveEdit = async () => {
    if (!playlist) return;

    const { error } = await updatePlaylist(playlist.id, {
      name: editName,
      description: editDescription,
    });

    if (!error) {
      setPlaylist({ ...playlist, name: editName, description: editDescription });
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!playlist) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Playlist not found</h2>
          <p className="text-[#B3B3B3]">This playlist doesn&apos;t exist or has been deleted.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-end gap-6 mb-8">
          <div className="w-56 h-56 bg-gradient-to-br from-purple-700 to-blue-300 rounded-lg shadow-2xl flex items-center justify-center">
            {playlist.thumbnail ? (
              <Image
                src={playlist.thumbnail}
                alt={playlist.name}
                width={224}
                height={224}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm text-[#B3B3B3] uppercase font-bold mb-2">Playlist</p>
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-5xl font-bold text-white bg-transparent border-b-2 border-[#1DB954] focus:outline-none mb-4 w-full max-w-xl"
              />
            ) : (
              <h1 className="text-5xl font-bold text-white mb-4">{playlist.name}</h1>
            )}
            {isEditing ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="text-[#B3B3B3] bg-transparent border-b border-[#282828] focus:border-[#1DB954] focus:outline-none w-full max-w-xl resize-none"
                rows={2}
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-[#B3B3B3] mb-2">{playlist.description || 'No description'}</p>
            )}
            <p className="text-sm text-[#B3B3B3]">
              {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handlePlayAll}
            disabled={playlist.songs.length === 0}
            className="w-14 h-14 rounded-full bg-[#1DB954] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
          >
            <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-[#B3B3B33] text-white font-bold rounded-full hover:border-white transition-colors"
          >
            Edit
          </button>
          {isEditing && (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(playlist.name);
                  setEditDescription(playlist.description || '');
                }}
                className="px-4 py-2 text-[#B3B3B3] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#1DB954] text-black font-bold rounded-full hover:bg-[#1ed760] transition-colors"
              >
                Save
              </button>
            </>
          )}
        </div>

        {/* Songs List */}
        {playlist.songs.length > 0 ? (
          <div className="bg-[#181818] rounded-lg">
            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-2 border-b border-[#282828] text-[#B3B3B3] text-sm">
              <div>#</div>
              <div>Title</div>
              <div className="hidden md:block">Album</div>
              <div className="text-right">Duration</div>
            </div>

            {/* Songs */}
            <div>
              {playlist.songs.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  index={index + 1}
                  queue={playlist.songs}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold text-white mb-2">This playlist is empty</h2>
            <p className="text-[#B3B3B3]">
              Find songs you like and add them to this playlist.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
