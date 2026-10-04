import lines from '../game/voiceLines.json';

type Clip = Pick<HTMLAudioElement, 'play' | 'pause' | 'volume' | 'onended' | 'onerror'>;
type CreateClip = (url: string) => Clip;
const recordings = new Map(lines.map((line) => [line.message, line.id]));

/** A single voice channel: new interactions replace old speech, never queue it. */
export class VoicePlayer {
  private current: { id: string; clip: Clip } | null = null;

  constructor(
    private readonly baseUrl: string,
    private readonly createClip: CreateClip = (url) => new Audio(url),
  ) {}

  speak(message: string) {
    const id = recordings.get(message);
    if (!id) return;
    if (this.current?.id === id) return;
    this.stop();
    const clip = this.createClip(`${this.baseUrl}audio/${id}.mp3`);
    clip.volume = 0.85;
    this.current = { id, clip };
    const finish = () => {
      if (this.current?.clip === clip) this.current = null;
    };
    const fail = () => {
      clip.pause();
      finish();
    };
    clip.onended = finish;
    clip.onerror = fail;
    // Start inside the tap handler so mobile browsers retain user activation.
    try {
      void clip.play().catch(fail);
    } catch {
      fail();
    }
  }

  stop() {
    if (!this.current) return;
    const { clip } = this.current;
    this.current = null;
    clip.onended = null;
    clip.onerror = null;
    clip.pause();
  }
}
