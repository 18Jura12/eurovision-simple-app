import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EventService } from './event.service';

const DB = 'https://sm-euro-default-rtdb.europe-west1.firebasedatabase.app';

@Injectable({providedIn: 'root'})
export class DataStorageService {

  constructor(private http: HttpClient, private eventService: EventService) {}

  private get basePath(): string {
    const { year, event } = this.eventService.getActive();
    return `${DB}/votes/${year}/${event}`;
  }

  storeVotes(user: string, votes: {[country: string]: number}): Observable<any> {
    return this.http.put(`${this.basePath}/${user}.json`, votes);
  }

  fetchUserVotes(user: string): Observable<{[country: string]: number} | null> {
    return this.http.get<{[country: string]: number} | null>(`${this.basePath}/${user}.json`);
  }

  fetchAllVotes(): Observable<{[user: string]: {[country: string]: number}} | null> {
    return this.http.get<{[user: string]: {[country: string]: number}} | null>(`${this.basePath}.json`);
  }

  fetchCatalog(): Observable<{[year: string]: {[event: string]: {countries: string[]}}} | null> {
    return this.http.get<any>(`${DB}/catalog.json`);
  }

}
