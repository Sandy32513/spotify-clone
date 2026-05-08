import fs from 'fs/promises';
import path from 'path';

export class PipelineLogger {
  private logPath: string;

  constructor(reportsDir: string) {
    this.logPath = path.join(reportsDir, 'pipeline.log');
  }

  async init() {
    await fs.mkdir(path.dirname(this.logPath), { recursive: true });
  }

  async info(message: string, extra: Record<string, unknown> = {}) {
    await this.write('info', message, extra);
  }

  async warn(message: string, extra: Record<string, unknown> = {}) {
    await this.write('warn', message, extra);
  }

  async error(message: string, extra: Record<string, unknown> = {}) {
    await this.write('error', message, extra);
  }

  private async write(level: 'info' | 'warn' | 'error', message: string, extra: Record<string, unknown>) {
    const line = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...extra,
    });
    await fs.appendFile(this.logPath, `${line}\n`, 'utf8');
  }
}

