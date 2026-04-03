import { Component, OnInit } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { EventService } from '../shared/event.service';
import { EventConfig, EventType } from '../shared/event-config';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less']
})
export class AdminComponent implements OnInit {
  catalog: {[year: string]: {[event: string]: {countries: string[]}}} = {};
  isLoading = false;
  activeEvent: EventConfig;

  isAuthenticated = false;
  passwordInput = '';
  passwordError = false;
  private passwordHash: string | null = null;

  constructor(
    private dataStorageService: DataStorageService,
    private eventService: EventService
  ) {
    this.activeEvent = eventService.getActive();
  }

  ngOnInit(): void {
    this.isAuthenticated = sessionStorage.getItem('admin_authed') === 'true';
    this.dataStorageService.fetchAdminPasswordHash().subscribe(h => this.passwordHash = h);
    if (this.isAuthenticated) {
      this.loadCatalog();
    }
  }

  async checkPassword(): Promise<void> {
    const encoder = new TextEncoder();
    const data = encoder.encode(this.passwordInput);
    const buf = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (hex === this.passwordHash) {
      sessionStorage.setItem('admin_authed', 'true');
      this.isAuthenticated = true;
      this.loadCatalog();
    } else {
      this.passwordError = true;
    }
  }

  private loadCatalog(): void {
    this.isLoading = true;
    this.dataStorageService.fetchCatalog().subscribe(data => {
      this.isLoading = false;
      this.catalog = data || {};
    });
  }

  get years(): string[] {
    return Object.keys(this.catalog).sort((a, b) => +b - +a);
  }

  getEvents(year: string): string[] {
    const order: {[k: string]: number} = { SF1: 0, SF2: 1, Final: 2 };
    return Object.keys(this.catalog[year]).sort((a, b) => (order[a] ?? 9) - (order[b] ?? 9));
  }

  getCountries(year: string, event: string): string[] {
    return this.catalog[year]?.[event]?.countries || [];
  }

  isActive(year: string, event: string): boolean {
    return this.activeEvent.year === +year && this.activeEvent.event === (event as EventType);
  }

  selectEvent(year: string, event: string): void {
    const countries = this.getCountries(year, event);
    this.eventService.setActive({ year: +year, event: event as EventType, countries });
    window.location.href = '/login';
  }
}
