import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LyricsEntry, LyricsText } from '../lyrics';

@Component({
  selector: 'app-lyrics-panel',
  templateUrl: './lyrics-panel.component.html',
  styleUrls: ['./lyrics-panel.component.less']
})
export class LyricsPanelComponent implements OnChanges {
  @Input() open = false;
  @Input() entry: LyricsEntry | null = null;
  @Input() countryName = '';
  @Input() countryFlag = '';
  @Output() closed = new EventEmitter<void>();

  lang: 'native' | 'english' = 'native';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entry'] && this.entry) {
      this.lang = this.entry.native ? 'native' : 'english';
    }
  }

  get text(): LyricsText | null {
    if (!this.entry) return null;
    return this.lang === 'native' ? this.entry.native : (this.entry.english ?? this.entry.native);
  }

  close(): void {
    this.closed.emit();
  }
}
