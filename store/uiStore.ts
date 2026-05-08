import { create } from 'zustand';
import type { ViewMode, Song } from '@/types';

interface UIStore {
  // Navigation
  currentView: ViewMode;
  selectedPlaylistId: string | null;
  selectedAlbumId: string | null;
  selectedArtistId: string | null;

  // Sidebar
  isSidebarOpen: boolean;
  isLibraryOpen: boolean;

  // Player
  isPlayerExpanded: boolean;
  showQueue: boolean;

  // Modals
  isCreatePlaylistModalOpen: boolean;
  isSearchModalOpen: boolean;
  isNowPlayingModalOpen: boolean;

  // Search
  searchQuery: string;
  searchResults: {
    songs: Song[];
    albums: any[];
    artists: any[];
    playlists: any[];
  } | null;
  isSearching: boolean;

  // Actions
  setCurrentView: (view: ViewMode) => void;
  setSelectedPlaylist: (id: string | null) => void;
  setSelectedAlbum: (id: string | null) => void;
  setSelectedArtist: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleLibrary: () => void;
  setLibraryOpen: (open: boolean) => void;
  togglePlayerExpanded: () => void;
  toggleQueue: () => void;
  openCreatePlaylistModal: () => void;
  closeCreatePlaylistModal: () => void;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  openNowPlayingModal: () => void;
  closeNowPlayingModal: () => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: any) => void;
  setIsSearching: (searching: boolean) => void;
  resetNavigation: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Navigation
  currentView: 'home',
  selectedPlaylistId: null,
  selectedAlbumId: null,
  selectedArtistId: null,

  // Sidebar
  isSidebarOpen: true,
  isLibraryOpen: true,

  // Player
  isPlayerExpanded: false,
  showQueue: false,

  // Modals
  isCreatePlaylistModalOpen: false,
  isSearchModalOpen: false,
  isNowPlayingModalOpen: false,

  // Search
  searchQuery: '',
  searchResults: null,
  isSearching: false,

  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedPlaylist: (id) => set({ selectedPlaylistId: id, currentView: id ? 'playlist' : 'home' }),
  setSelectedAlbum: (id) => set({ selectedAlbumId: id, currentView: id ? 'album' : 'home' }),
  setSelectedArtist: (id) => set({ selectedArtistId: id, currentView: id ? 'artist' : 'home' }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleLibrary: () => set((state) => ({ isLibraryOpen: !state.isLibraryOpen })),
  setLibraryOpen: (open) => set({ isLibraryOpen: open }),
  togglePlayerExpanded: () => set((state) => ({ isPlayerExpanded: !state.isPlayerExpanded })),
  toggleQueue: () => set((state) => ({ showQueue: !state.showQueue })),
  openCreatePlaylistModal: () => set({ isCreatePlaylistModalOpen: true }),
  closeCreatePlaylistModal: () => set({ isCreatePlaylistModalOpen: false }),
  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),
  openNowPlayingModal: () => set({ isNowPlayingModalOpen: true }),
  closeNowPlayingModal: () => set({ isNowPlayingModalOpen: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (searching) => set({ isSearching: searching }),
  resetNavigation: () => set({
    currentView: 'home',
    selectedPlaylistId: null,
    selectedAlbumId: null,
    selectedArtistId: null,
  }),
}));
