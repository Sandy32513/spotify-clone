import chokidar from 'chokidar';
import { runMusicPipeline } from './pipeline';
import type { PipelineConfig } from './types';

export function watchMusicFolder(config: Partial<PipelineConfig>) {
  let running = false;
  let queued = false;

  async function enqueue() {
    if (running) {
      queued = true;
      return;
    }

    running = true;
    do {
      queued = false;
      await runMusicPipeline(config);
    } while (queued);
    running = false;
  }

  const watcher = chokidar.watch(config.rootDir ?? 'C:\\Users\\SANDY\\Music', {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 3000,
      pollInterval: 250,
    },
    ignored: /(^|[/\\])\.music-pipeline([/\\]|$)/,
  });

  watcher.on('add', enqueue);
  watcher.on('change', enqueue);
  watcher.on('addDir', enqueue);

  return watcher;
}

