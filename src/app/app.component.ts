import { Component, HostListener } from '@angular/core';
import { EventService } from './shared/event.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }
  title: string;

  constructor(eventService: EventService) {
    const active = eventService.getActive();
    this.title = `Eurovision ${active.year} ${active.event}`;
  }
}
