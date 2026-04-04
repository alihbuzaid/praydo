import {
  BaseDirectory,
  mkdir,
  readDir,
  readFile,
  writeFile,
} from '@tauri-apps/plugin-fs';

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];
const BUNDLED_SOUND_DIRECTORY = 'assets';
const CUSTOM_SOUND_DIRECTORY = 'sounds';

function getMimeType(fileName: string): string {
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

  switch (extension) {
    case '.wav':
      return 'audio/wav';
    case '.ogg':
      return 'audio/ogg';
    case '.m4a':
      return 'audio/mp4';
    case '.mp3':
    default:
      return 'audio/mpeg';
  }
}

function isSupportedAudioFile(fileName: string) {
  return AUDIO_EXTENSIONS.some((extension) =>
    fileName.toLowerCase().endsWith(extension)
  );
}

function sanitizeSoundFileName(fileName: string) {
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  const baseName = fileName
    .replace(/\.[^.]+$/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${baseName || 'azan-sound'}-${Date.now()}${extension}`;
}

async function ensureCustomSoundDirectory() {
  await mkdir(CUSTOM_SOUND_DIRECTORY, {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  });
}

async function getSoundFilesInDirectory(
  directory: string,
  baseDir: BaseDirectory
) {
  try {
    const entries = await readDir(directory, { baseDir });

    return entries
      .filter((entry) => entry.isFile)
      .map((entry) => entry.name)
      .filter((name) => isSupportedAudioFile(name));
  } catch {
    return [];
  }
}

export async function getAvailableSoundFiles() {
  const [bundledSounds, customSounds] = await Promise.all([
    getSoundFilesInDirectory(BUNDLED_SOUND_DIRECTORY, BaseDirectory.Resource),
    getSoundFilesInDirectory(CUSTOM_SOUND_DIRECTORY, BaseDirectory.AppData),
  ]);

  return Array.from(new Set([...bundledSounds, ...customSounds])).sort(
    (left, right) => left.localeCompare(right)
  );
}

export function formatSoundLabel(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export async function uploadCustomSound(file: File) {
  if (!isSupportedAudioFile(file.name)) {
    throw new Error('Unsupported audio file. Use MP3, WAV, OGG, or M4A.');
  }

  await ensureCustomSoundDirectory();

  const fileName = sanitizeSoundFileName(file.name);
  const fileBytes = new Uint8Array(await file.arrayBuffer());

  await writeFile(`${CUSTOM_SOUND_DIRECTORY}/${fileName}`, fileBytes, {
    baseDir: BaseDirectory.AppData,
  });

  return fileName;
}

async function readSoundBytes(fileName: string) {
  try {
    return await readFile(`${CUSTOM_SOUND_DIRECTORY}/${fileName}`, {
      baseDir: BaseDirectory.AppData,
    });
  } catch {
    return readFile(`${BUNDLED_SOUND_DIRECTORY}/${fileName}`, {
      baseDir: BaseDirectory.Resource,
    });
  }
}

export async function playSound(fileName: string) {
  const filePath = await readSoundBytes(fileName);
  const mimeType = getMimeType(fileName);
  const blob = new Blob([new Uint8Array(filePath)], { type: mimeType });
  const assetUrl = URL.createObjectURL(blob);
  const audio = new Audio(assetUrl);
  const cleanup = () => URL.revokeObjectURL(assetUrl);

  audio.addEventListener('ended', cleanup, { once: true });
  audio.addEventListener('error', cleanup, { once: true });
  void audio.play().catch((error) => {
    cleanup();
    console.error('Failed to play sound', error);
  });
}
