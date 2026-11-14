export interface LyricsText {
  language?: string;
  title: string;
  verses: string[][];
}

export interface LyricsEntry {
  native: LyricsText;
  english?: LyricsText;
}
