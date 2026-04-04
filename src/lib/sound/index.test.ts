import { beforeEach, describe, expect, it, vi } from 'vitest';

const fsMocks = vi.hoisted(() => ({
  readDir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
  BaseDirectory: {
    Resource: 'resource',
    AppData: 'appData',
  },
  readDir: fsMocks.readDir,
  readFile: fsMocks.readFile,
  writeFile: fsMocks.writeFile,
  mkdir: fsMocks.mkdir,
}));

import { getAvailableSoundFiles, playSound, uploadCustomSound } from './index';

describe('sound helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();

    fsMocks.mkdir.mockResolvedValue(undefined);
    fsMocks.writeFile.mockResolvedValue(undefined);

    vi.stubGlobal('Audio', function () {
      return {
        addEventListener: vi.fn(),
        play: vi.fn().mockResolvedValue(undefined),
      };
    });

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-sound'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('merges bundled and uploaded sound files without duplicates', async () => {
    fsMocks.readDir.mockImplementation(
      async (_directory: string, options?: { baseDir?: string }) => {
        if (options?.baseDir === 'resource') {
          return [
            { isFile: true, name: 'solemn.mp3' },
            { isFile: true, name: 'fajr.mp3' },
            { isFile: true, name: 'readme.txt' },
          ];
        }

        return [
          { isFile: true, name: 'custom-call.wav' },
          { isFile: true, name: 'solemn.mp3' },
        ];
      }
    );

    await expect(getAvailableSoundFiles()).resolves.toEqual([
      'custom-call.wav',
      'fajr.mp3',
      'solemn.mp3',
    ]);
  });

  it('writes uploaded sound files into app data with a sanitized file name', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    const file = new File([Uint8Array.from([1, 2, 3])], 'My Azan Sound.MP3', {
      type: 'audio/mpeg',
    });

    await expect(uploadCustomSound(file)).resolves.toBe(
      'my-azan-sound-1700000000000.mp3'
    );

    expect(fsMocks.mkdir).toHaveBeenCalledWith('sounds', {
      baseDir: 'appData',
      recursive: true,
    });
    expect(fsMocks.writeFile).toHaveBeenCalledWith(
      'sounds/my-azan-sound-1700000000000.mp3',
      expect.any(Uint8Array),
      { baseDir: 'appData' }
    );
  });

  it('falls back to bundled assets when a custom sound file does not exist', async () => {
    fsMocks.readFile.mockImplementation(
      async (path: string, options?: { baseDir?: string }) => {
        if (path === 'sounds/solemn.mp3' && options?.baseDir === 'appData') {
          throw new Error('not found');
        }

        if (path === 'assets/solemn.mp3' && options?.baseDir === 'resource') {
          return Uint8Array.from([9, 8, 7]);
        }

        throw new Error(`Unexpected read: ${path}`);
      }
    );

    await playSound('solemn.mp3');

    expect(fsMocks.readFile).toHaveBeenNthCalledWith(1, 'sounds/solemn.mp3', {
      baseDir: 'appData',
    });
    expect(fsMocks.readFile).toHaveBeenNthCalledWith(2, 'assets/solemn.mp3', {
      baseDir: 'resource',
    });
  });
});
