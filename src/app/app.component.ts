import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DataStorageService } from './shared/data-storage.service';
import { EventService } from './shared/event.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }
  title: string;
  private pollInterval: any;

  constructor(
    private eventService: EventService,
    private dataStorageService: DataStorageService,
    private router: Router
  ) {
    const active = eventService.getActive();
    this.title = `Eurovision ${active.year} ${active.event}`;
  }

  ngOnInit(): void {
    this.syncActiveEvent();
    this.pollInterval = setInterval(() => this.syncActiveEvent(), 10000);
    this.updateViewport(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      this.updateViewport((e as NavigationEnd).urlAfterRedirects);
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.pollInterval);
  }

  // The app otherwise uses a fixed 960px virtual viewport (older default, kept
  // for any routes without a responsive layout of their own). Login, voting
  // and results all have real mobile layouts now, so they use the actual
  // device width instead of being rendered tiny inside that 960px canvas.
  private updateViewport(url: string): void {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    const responsive = url.startsWith('/vote') || url.startsWith('/result') || url.startsWith('/login');
    meta.setAttribute('content', responsive
      ? 'width=device-width, initial-scale=1'
      : 'width=960');
  }

  private syncActiveEvent(): void {
    this.dataStorageService.fetchActiveEvent().subscribe((remote: any) => {
      if (!remote) return;
      const local = this.eventService.getActive();
      if (remote.year !== local.year || remote.event !== local.event) {
        this.eventService.setActive(remote);
        this.router.navigate(['/login']);
      }
    });
  }
}
