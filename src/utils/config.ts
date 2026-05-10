import * as fs from 'fs';
import * as path from 'path';

/**
 * Write content to a file, creating any missing parent directories.
 * Throws if the file already exists and overwrite is false.
 */
export async function writeConfig(
  outputPath: string,
  content: string,
  overwrite: boolean
): Promise<void> {
  const dir = path.dirname(outputPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(outputPath) && !overwrite) {
    throw new Error(
      `A file already exists at ${outputPath}.\nUse --overwrite to replace it.`
    );
  }

  fs.writeFileSync(outputPath, content, 'utf8');
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
