import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Player from './Player';
import QueuePanel from './QueuePanel';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, refreshSession } = useAuthStore();
  const { showQueue } = useUIStore();

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="w-12 h-12 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#121212]">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="gradient-overlay absolute top-0 left-0 right-0 h-80 pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </main>

      {/* Player */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Player />
      </div>

      {/* Queue Panel */}
      {showQueue && <QueuePanel />}
    </div>
  );
}
