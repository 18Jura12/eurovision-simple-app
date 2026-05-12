import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  }

  ngOnDestroy(): void {
    clearInterval(this.pollInterval);
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
