import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-[#B3B3B3] mb-6">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="px-6 py-2 bg-[#1DB954] text-black font-semibold rounded-full hover:scale-105 transition-transform inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}