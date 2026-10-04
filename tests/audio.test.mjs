import { describe, it, expect, vi } from 'vite-plus/test';
import { VoicePlayer } from '../src/lib/VoicePlayer';
import lines from '../src/game/voiceLines.json';

function setup({ denied = false } = {}) {
  const clips = [];
  const create = (url) => {
    const clip = {
      src: url,
      volume: 1,
      currentTime: 0,
      onended: null,
      onerror: null,
      pause: vi.fn(),
      play: denied
        ? vi.fn().mockRejectedValue(new Error('NotAllowedError'))
        : vi.fn().mockResolvedValue(undefined),
    };
    clips.push(clip);
    return clip;
  };
  return { clips, player: new VoicePlayer('/kabu-forest-picnic/', create) };
}
describe('recorded voice playback', () => {
  it('plays deployed files under the project base path', () => {
    const { player, clips } = setup();
    player.speak(lines[0].message);
    expect(clips[0].src).toBe(`/kabu-forest-picnic/audio/${lines[0].id}.mp3`);
    expect(clips[0].play).toHaveBeenCalledOnce();
  });
  it('replaces the current voice immediately, without accumulating a queue', () => {
    const { player, clips } = setup();
    player.speak(lines[0].message);
    player.speak(lines[1].message);
    expect(clips[0].pause).toHaveBeenCalledOnce();
    expect(clips[1].play).toHaveBeenCalledOnce();
    player.stop();
    expect(clips[1].pause).toHaveBeenCalledOnce();
  });
  it('does not restart an identical playing line but permits replay after it ends', () => {
    const { player, clips } = setup();
    player.speak(lines[0].message);
    player.speak(lines[0].message);
    expect(clips).toHaveLength(1);
    clips[0].onended();
    player.speak(lines[0].message);
    expect(clips).toHaveLength(2);
  });
  it('ignores unknown error messages and safely handles playback denied by the browser', async () => {
    const { player, clips } = setup();
    player.speak('an arbitrary export error');
    expect(clips).toHaveLength(0);
    player.speak(lines[0].message);
    player.stop();
    const rejected = setup({ denied: true });
    rejected.player.speak(lines[0].message);
    await Promise.resolve();
    expect(rejected.clips[0].pause).toHaveBeenCalledOnce();
    rejected.player.speak(lines[0].message);
    expect(rejected.clips).toHaveLength(2);
    rejected.player.stop();
    await Promise.resolve();
  });
  it('has unique messages, filenames and nonempty narration', () => {
    expect(new Set(lines.map((line) => line.message)).size).toBe(lines.length);
    expect(new Set(lines.map((line) => line.id)).size).toBe(lines.length);
    for (const line of lines) {
      expect(line.id).toMatch(/^[a-z0-9-]+$/);
      expect(line.text.trim().length).toBeGreaterThan(0);
    }
  });
});
