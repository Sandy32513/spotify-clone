#!/usr/bin/env tsx
import { createPipelineConfig, runMusicPipeline, watchMusicFolder } from '../lib/music-pipeline';

type CliOptions = {
  command: 'analyze' | 'run' | 'watch';
  rootDir?: string;
  apply?: boolean;
  extract?: boolean;
  organize?: boolean;
  moveCorrupted?: boolean;
  upload?: boolean;
  db?: boolean;
  cloudProvider?: 'none' | 'local' | 'supabase';
  databaseProvider?: 'none' | 'supabase';
};

function parseArgs(argv: string[]): CliOptions {
  const [commandArg = 'analyze', ...flags] = argv;
  const command = ['analyze', 'run', 'watch'].includes(commandArg)
    ? (commandArg as CliOptions['command'])
    : 'analyze';
  const options: CliOptions = { command };

  for (const flag of flags) {
    if (flag === '--apply') options.apply = true;
    else if (flag === '--extract') options.extract = true;
    else if (flag === '--organize') options.organize = true;
    else if (flag === '--move-corrupted') options.moveCorrupted = true;
    else if (flag === '--upload') options.upload = true;
    else if (flag === '--db') options.db = true;
    else if (flag.startsWith('--root=')) options.rootDir = flag.slice('--root='.length);
    else if (flag.startsWith('--cloud=')) options.cloudProvider = flag.slice('--cloud='.length) as CliOptions['cloudProvider'];
    else if (flag.startsWith('--database=')) options.databaseProvider = flag.slice('--database='.length) as CliOptions['databaseProvider'];
  }

  return options;
}

function configFromCli(options: CliOptions) {
  const analyzeOnly = options.command === 'analyze';
  return createPipelineConfig({
    rootDir: options.rootDir,
    dryRun: !options.apply,
    extractArchives: analyzeOnly ? false : Boolean(options.extract),
    organize: analyzeOnly ? false : Boolean(options.organize),
    moveCorrupted: analyzeOnly ? false : Boolean(options.moveCorrupted),
    upload: analyzeOnly ? false : Boolean(options.upload),
    insertDatabase: analyzeOnly ? false : Boolean(options.db),
    watch: options.command === 'watch',
    cloudProvider: options.cloudProvider,
    databaseProvider: options.databaseProvider,
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const config = configFromCli(options);

  if (options.command === 'watch') {
    console.log(`Watching ${config.rootDir}`);
    console.log(`Dry run: ${config.dryRun}`);
    watchMusicFolder(config);
    return;
  }

  const { summary, reportDir } = await runMusicPipeline(config);
  console.log(`Report directory: ${reportDir}`);
  console.log(JSON.stringify(summary.totals, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

