// Import URLs, not audio bytes. The browser still downloads only the line being played.
const sources = import.meta.glob<string>('./audio/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const recordingUrls: Record<string, string> = Object.fromEntries(
  Object.entries(sources).map(([path, url]) => [
    path
      .split('/')
      .at(-1)!
      .replace(/\.mp3$/, ''),
    url,
  ]),
);
