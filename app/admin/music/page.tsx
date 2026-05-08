'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Cloud,
  Database,
  FileAudio,
  FolderOpen,
  LogIn,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  XCircle,
} from 'lucide-react';

type ScanTotals = {
  directories: number;
  files: number;
  audioFiles: number;
  archives: number;
  unsupportedFiles: number;
  hiddenFiles: number;
  emptyFolders: number;
  bytes: number;
};

type AnalysisResult = {
  reportDir: string;
  rootDir: string;
  storageProvider: string;
  databaseProvider: string;
  totals: {
    discoveredAudio: number;
    validatedAudio: number;
    corruptedAudio: number;
    exactDuplicates: number;
    nearDuplicateGroups: number;
    uploaded: number;
    databaseInserted: number;
  };
  scan: ScanTotals;
  errors: Array<{ stage: string; path?: string; message: string }>;
};

type UploadResponse = {
  uploadId: string;
  reportDir: string;
  storageProvider: string;
  databaseProvider: string;
  rejected: Array<{ path: string; size: number; status: string; reason: string }>;
  warnings: string[];
  totals: AnalysisResult['totals'];
  scan: ScanTotals;
  files: Array<{
    name: string;
    path: string;
    status: string;
    reason?: string;
    title: string;
    artist: string;
    album: string;
    durationSeconds: number;
    fileSize: number;
    upload?: { status: string; provider: string; publicUrl?: string; secureUrl?: string; error?: string };
    database?: { status: string; id?: string; error?: string };
  }>;
  errors: Array<{ stage: string; path?: string; message: string }>;
};

type QueuedFile = {
  id: string;
  file: File;
  relativePath: string;
  duplicateWarning?: string;
};

type BrowserFileEntry = {
  isFile: true;
  isDirectory: false;
  name: string;
  file: (success: (file: File) => void, error?: (error: DOMException) => void) => void;
};

type BrowserDirectoryEntry = {
  isFile: false;
  isDirectory: true;
  name: string;
  createReader: () => {
    readEntries: (
      success: (entries: BrowserEntry[]) => void,
      error?: (error: DOMException) => void
    ) => void;
  };
};

type BrowserEntry = BrowserFileEntry | BrowserDirectoryEntry;

type DataTransferItemWithEntry = DataTransferItem & {
  webkitGetAsEntry?: () => BrowserEntry | null;
};

const acceptedExtensions = '.mp3,.wav,.flac,.aac,.m4a,.ogg,.opus,.wma,.alac,.aiff,.zip,.rar,.7z,.tar,.gz';

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatSeconds(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

function relativePathFor(file: File) {
  return (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
}

function fileId(file: File, relativePath = relativePathFor(file)) {
  return `${relativePath}:${file.size}:${file.lastModified}`;
}

async function fileFromEntry(entry: BrowserFileEntry, prefix: string) {
  return new Promise<QueuedFile>((resolve, reject) => {
    entry.file(
      (file) => {
        const relativePath = `${prefix}${file.name}`;
        resolve({ id: fileId(file, relativePath), file, relativePath });
      },
      (error) => reject(error)
    );
  });
}

async function entriesFromDirectory(entry: BrowserDirectoryEntry, prefix = ''): Promise<QueuedFile[]> {
  const reader = entry.createReader();
  const children: BrowserEntry[] = [];

  await new Promise<void>((resolve, reject) => {
    const readBatch = () => {
      reader.readEntries(
        (entries) => {
          if (entries.length === 0) {
            resolve();
            return;
          }
          children.push(...entries);
          readBatch();
        },
        (error) => reject(error)
      );
    };
    readBatch();
  });

  const nested = await Promise.all(children.map((child) => filesFromEntry(child, `${prefix}${entry.name}/`)));
  return nested.flat();
}

async function filesFromEntry(entry: BrowserEntry, prefix = ''): Promise<QueuedFile[]> {
  if (entry.isFile) return [await fileFromEntry(entry, prefix)];
  return entriesFromDirectory(entry, prefix);
}

function StatusPill({ tone, children }: { tone: 'ok' | 'warn' | 'bad' | 'idle'; children: React.ReactNode }) {
  const className =
    tone === 'ok'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
      : tone === 'warn'
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
        : tone === 'bad'
          ? 'border-red-500/40 bg-red-500/10 text-red-200'
          : 'border-white/10 bg-white/5 text-zinc-300';

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

export default function MusicAdminPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [uploadEta, setUploadEta] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [history, setHistory] = useState<UploadResponse[]>([]);

  const queueBytes = useMemo(() => queue.reduce((sum, item) => sum + item.file.size, 0), [queue]);
  const duplicateWarnings = queue.filter((item) => item.duplicateWarning).length;

  useEffect(() => {
    fetch('/api/admin/session')
      .then((response) => response.json())
      .then((data) => setAuthenticated(Boolean(data.authenticated)))
      .catch(() => setAuthenticated(false));

    const stored = localStorage.getItem('music-admin-upload-history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('music-admin-upload-history', JSON.stringify(history.slice(0, 8)));
  }, [history]);

  function requireAdmin(action: () => void) {
    if (!authenticated) {
      setAuthMessage('Please contact administrator for upload access.');
      setLoginOpen(true);
      return;
    }
    action();
  }

  function addFiles(items: QueuedFile[]) {
    setQueue((current) => {
      const seen = new Set(current.map((item) => item.id));
      const incomingFingerprints = new Map<string, number>();

      return [
        ...current,
        ...items
          .map((item) => {
            const fingerprint = `${item.file.name.toLowerCase()}:${item.file.size}`;
            const count = incomingFingerprints.get(fingerprint) ?? 0;
            incomingFingerprints.set(fingerprint, count + 1);
            return {
              ...item,
              duplicateWarning:
                count > 0 || current.some((existing) => `${existing.file.name.toLowerCase()}:${existing.file.size}` === fingerprint)
                  ? 'Same filename and size already queued'
                  : undefined,
            };
          })
          .filter((item) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          }),
      ];
    });
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage('');
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      setAuthMessage(data.message || 'Please contact administrator for upload access.');
      setAuthenticated(false);
      return;
    }

    setAuthenticated(true);
    setLoginOpen(false);
    setPassword('');
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setLoginOpen(false);
  }

  async function analyzeLibrary() {
    requireAdmin(async () => {
      setAnalyzing(true);
      setAnalysis(null);
      try {
        const response = await fetch('/api/admin/music/analyze', { method: 'POST' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Analysis failed');
        setAnalysis(data);
      } catch (error) {
        setAuthMessage(error instanceof Error ? error.message : 'Analysis failed');
      } finally {
        setAnalyzing(false);
      }
    });
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);

    if (!authenticated) {
      setAuthMessage('Please contact administrator for upload access.');
      setLoginOpen(true);
      return;
    }

    const entries = Array.from(event.dataTransfer.items)
      .map((item) => (item as DataTransferItemWithEntry).webkitGetAsEntry?.())
      .filter(Boolean) as unknown as BrowserEntry[];

    if (entries.length > 0) {
      const nested = await Promise.all(entries.map((entry) => filesFromEntry(entry)));
      addFiles(nested.flat());
      return;
    }

    addFiles(
      Array.from(event.dataTransfer.files).map((file) => ({
        id: fileId(file),
        file,
        relativePath: relativePathFor(file),
      }))
    );
  }

  function handlePickedFiles(files: FileList | null) {
    if (!files) return;
    addFiles(
      Array.from(files).map((file) => {
        const relativePath = relativePathFor(file);
        return { id: fileId(file, relativePath), file, relativePath };
      })
    );
  }

  function uploadQueue() {
    requireAdmin(() => {
      if (queue.length === 0 || uploading) return;
      const formData = new FormData();
      for (const item of queue) {
        formData.append('files', item.file, item.relativePath);
        formData.append('relativePaths', item.relativePath);
      }

      setUploading(true);
      setUploadProgress(0);
      setUploadSpeed(0);
      setUploadEta(0);
      setUploadResult(null);
      const startedAt = Date.now();

      const request = new XMLHttpRequest();
      request.open('POST', '/api/admin/music/upload');
      request.withCredentials = true;
      request.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const elapsedSeconds = Math.max((Date.now() - startedAt) / 1000, 0.1);
        const speed = event.loaded / elapsedSeconds;
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
        setUploadSpeed(speed);
        setUploadEta((event.total - event.loaded) / Math.max(speed, 1));
      };
      request.onload = () => {
        setUploading(false);
        const data = JSON.parse(request.responseText || '{}');
        if (request.status >= 400) {
          setAuthMessage(data.error || 'Upload failed');
          return;
        }
        setUploadProgress(100);
        setUploadResult(data);
        setHistory((current) => [data, ...current].slice(0, 8));
        setQueue([]);
      };
      request.onerror = () => {
        setUploading(false);
        setAuthMessage('Upload failed before the server could process the files.');
      };
      request.send(formData);
    });
  }

  const metricCards = analysis
    ? [
        ['Total files', analysis.scan.files],
        ['Music files', analysis.scan.audioFiles],
        ['Archives', analysis.scan.archives],
        ['Storage', formatBytes(analysis.scan.bytes)],
        ['Duplicates', analysis.totals.exactDuplicates],
        ['Corrupted', analysis.totals.corruptedAudio],
      ]
    : [
        ['Total files', '-'],
        ['Music files', '-'],
        ['Archives', '-'],
        ['Storage', '-'],
        ['Duplicates', '-'],
        ['Corrupted', '-'],
      ];

  return (
    <main className="min-h-screen overflow-y-auto bg-[#121212] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-[#1DB954]" />
              Music Asset Administration
            </div>
            <h1 className="text-3xl font-bold">Asset Intake Console</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={authenticated ? 'ok' : 'warn'}>
              {authenticated ? 'Admin session active' : 'Upload access locked'}
            </StatusPill>
            {authenticated ? (
              <button onClick={handleLogout} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:border-white/40">
                Sign out
              </button>
            ) : (
              <button onClick={() => setLoginOpen(true)} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black hover:bg-zinc-200">
                <LogIn className="mr-2 inline h-4 w-4" />
                Admin login
              </button>
            )}
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {metricCards.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-[#181818] p-4">
              <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-white/10 bg-[#181818]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
              <div>
                <h2 className="text-lg font-bold">Upload Songs</h2>
                <p className="text-sm text-zinc-400">Audio, archive, and folder uploads are validated before cloud storage.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => requireAdmin(() => fileInputRef.current?.click())}
                  className="rounded-full bg-[#1DB954] px-4 py-2 text-sm font-bold text-black hover:bg-[#1ed760]"
                >
                  <UploadCloud className="mr-2 inline h-4 w-4" />
                  Upload Songs
                </button>
                <button
                  onClick={() => requireAdmin(() => folderInputRef.current?.click())}
                  className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:border-white/40"
                >
                  <FolderOpen className="mr-2 inline h-4 w-4" />
                  Folder
                </button>
              </div>
              <input ref={fileInputRef} type="file" multiple accept={acceptedExtensions} className="hidden" onChange={(event) => handlePickedFiles(event.target.files)} />
              <input
                ref={folderInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => handlePickedFiles(event.target.files)}
                {...({ webkitdirectory: 'true', directory: 'true' } as Record<string, string>)}
              />
            </div>

            <div className="p-4">
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition ${
                  dragActive ? 'border-[#1DB954] bg-[#1DB954]/10' : 'border-white/15 bg-black/20'
                }`}
              >
                <UploadCloud className="mb-4 h-10 w-10 text-[#1DB954]" />
                <p className="text-lg font-semibold">Drop music files or folders here</p>
                <p className="mt-2 max-w-xl text-sm text-zinc-400">
                  Supported audio: MP3, WAV, FLAC, AAC, M4A, OGG, OPUS, WMA, ALAC, AIFF. Archives: ZIP, RAR, 7z, TAR, GZ.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-sm text-zinc-400">
                  <StatusPill tone="idle">{queue.length} queued</StatusPill>
                  <StatusPill tone="idle">{formatBytes(queueBytes)}</StatusPill>
                  {duplicateWarnings > 0 && <StatusPill tone="warn">{duplicateWarnings} duplicate warnings</StatusPill>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setQueue([])} disabled={queue.length === 0 || uploading} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 disabled:opacity-40">
                    <Trash2 className="mr-2 inline h-4 w-4" />
                    Clear
                  </button>
                  <button onClick={uploadQueue} disabled={queue.length === 0 || uploading} className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black disabled:opacity-40">
                    {uploading ? 'Uploading...' : 'Start upload'}
                  </button>
                </div>
              </div>

              {uploading && (
                <div className="mt-4 rounded-lg bg-black/30 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Upload progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-[#1DB954]" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-zinc-400">
                    <span>{formatBytes(uploadSpeed)}/s</span>
                    <span>{formatSeconds(uploadEta)} remaining</span>
                    <span>Server validation starts after transfer completes</span>
                  </div>
                </div>
              )}

              {queue.length > 0 && (
                <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-white/10">
                  {queue.map((item) => (
                    <div key={item.id} className="grid grid-cols-[24px_1fr_auto] items-center gap-3 border-b border-white/10 px-3 py-2 last:border-b-0">
                      <FileAudio className="h-4 w-4 text-zinc-400" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.relativePath}</p>
                        {item.duplicateWarning && <p className="text-xs text-amber-300">{item.duplicateWarning}</p>}
                      </div>
                      <span className="text-xs text-zinc-400">{formatBytes(item.file.size)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-lg border border-white/10 bg-[#181818] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Library Analysis</h2>
                  <p className="text-sm text-zinc-400">Dry-run scan of C:\Users\SANDY\Music.</p>
                </div>
                <button onClick={analyzeLibrary} disabled={analyzing} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold hover:border-white/40 disabled:opacity-40">
                  <Search className="mr-2 inline h-4 w-4" />
                  {analyzing ? 'Scanning' : 'Analyze'}
                </button>
              </div>
              {analysis ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-lg bg-black/25 p-3">
                    <span className="text-zinc-400">Report</span>
                    <span className="max-w-64 truncate text-right">{analysis.reportDir}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <StatusPill tone={analysis.errors.length ? 'warn' : 'ok'}>{analysis.errors.length} errors</StatusPill>
                    <StatusPill tone="idle">{analysis.scan.unsupportedFiles} unsupported</StatusPill>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-black/25 p-4 text-sm text-zinc-400">
                  <BarChart3 className="h-5 w-5" />
                  Run analysis to populate folder, archive, duplicate, and corruption stats.
                </div>
              )}
            </div>

            <div className="rounded-lg border border-white/10 bg-[#181818] p-4">
              <h2 className="mb-3 text-lg font-bold">Upload Summary</h2>
              {uploadResult ? (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <StatusPill tone="ok">{uploadResult.totals.validatedAudio} valid</StatusPill>
                    <StatusPill tone={uploadResult.totals.corruptedAudio ? 'bad' : 'idle'}>{uploadResult.totals.corruptedAudio} corrupted</StatusPill>
                    <StatusPill tone="idle">{uploadResult.totals.exactDuplicates} duplicates</StatusPill>
                    <StatusPill tone={uploadResult.errors.length ? 'warn' : 'ok'}>{uploadResult.errors.length} errors</StatusPill>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Cloud className="h-4 w-4 text-[#1DB954]" />
                      Storage: {uploadResult.storageProvider}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Database className="h-4 w-4 text-[#1DB954]" />
                      Database: {uploadResult.databaseProvider}
                    </div>
                  </div>
                  {uploadResult.warnings.map((warning) => (
                    <p key={warning} className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">
                      {warning}
                    </p>
                  ))}
                  <div className="max-h-72 overflow-y-auto rounded-lg border border-white/10">
                    {uploadResult.files.map((file) => (
                      <div key={`${file.path}:${file.fileSize}`} className="grid grid-cols-[20px_1fr_auto] gap-3 border-b border-white/10 p-3 last:border-b-0">
                        {file.status === 'valid' ? (
                          <CheckCircle2 className="h-4 w-4 text-[#1DB954]" />
                        ) : file.status === 'duplicate' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-300" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-300" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{file.title}</p>
                          <p className="truncate text-xs text-zinc-400">{file.artist} · {file.album}</p>
                        </div>
                        <span className="text-xs text-zinc-400">{file.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-black/25 p-4 text-sm text-zinc-400">
                  <Clock className="h-5 w-5" />
                  Completed upload batches will appear here.
                </div>
              )}
            </div>
          </aside>
        </section>

        {history.length > 0 && (
          <section className="rounded-lg border border-white/10 bg-[#181818] p-4">
            <h2 className="mb-3 text-lg font-bold">Upload History</h2>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {history.map((item) => (
                <div key={item.uploadId} className="rounded-lg border border-white/10 bg-black/25 p-3">
                  <p className="truncate text-sm font-semibold">{item.uploadId}</p>
                  <p className="mt-1 text-xs text-zinc-400">{item.files.length} files · {item.storageProvider}</p>
                  <p className="mt-2 truncate text-xs text-zinc-500">{item.reportDir}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form onSubmit={handleLogin} className="w-full max-w-sm rounded-lg border border-white/10 bg-[#181818] p-5 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-[#1DB954]/15 p-2">
                <ShieldCheck className="h-5 w-5 text-[#1DB954]" />
              </div>
              <div>
                <h2 className="font-bold">Admin Login</h2>
                <p className="text-sm text-zinc-400">Upload routes are protected.</p>
              </div>
            </div>
            <label className="mb-3 block text-sm">
              <span className="mb-1 block text-zinc-400">Username</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-md border border-white/10 bg-black px-3 py-2 text-white" />
            </label>
            <label className="mb-4 block text-sm">
              <span className="mb-1 block text-zinc-400">Password</span>
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-md border border-white/10 bg-black px-3 py-2 text-white" />
            </label>
            {authMessage && <p className="mb-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{authMessage}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setLoginOpen(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold">
                Cancel
              </button>
              <button type="submit" className="rounded-full bg-[#1DB954] px-4 py-2 text-sm font-bold text-black">
                Login
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
