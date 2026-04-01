import { Injectable } from '@angular/core';
import { ACTIVE_EVENT, EventConfig, EventType } from './event-config';

@Injectable({providedIn: 'root'})
export class EventService {
  private readonly KEY = 'activeEvent';

  getActive(): EventConfig {
    const stored = localStorage.getItem(this.KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.year && parsed.event && Array.isArray(parsed.countries)) {
          return parsed as EventConfig;
        }
      } catch {}
    }
    return ACTIVE_EVENT;
  }

  setActive(config: EventConfig): void {
    localStorage.setItem(this.KEY, JSON.stringify(config));
  }
}
