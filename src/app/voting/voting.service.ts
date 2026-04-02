import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';
import { EventService } from '../shared/event.service';

export class SongDB {
  constructor(
    public countryFlag: string,
    public countryName: string,
    public points?: {[key: string]: number}
  ) {
    if(points === undefined) {
      this.points = {};
    }
  }

  getExpWeight(this: void, value: number): number {
    return value === +0 ? +0 : +((+12) * ((+0.827) ** (+value - 1))).toFixed(4);
  }

  getExpWeightTotal(): number {
    return +_.sum((_.values(this.points) as number[]).map(this.getExpWeight)).toFixed(3);
  }

  getTotal(): number {
    return _.sum(_.values(this.points));
  }

  get votes(): [string,number][] {
    return Object.entries(this.points!);
  }

}

@Injectable({providedIn: 'root'})
export class VotingService {
  songs: Map<string,SongDB> = new Map([
    ['Albania', new SongDB('al', 'Albania')],
    ['Armenia', new SongDB('am', 'Armenia')],
    ['Australia', new SongDB('au', 'Australia')],
    ['Austria', new SongDB('at', 'Austria')],
    ['Azerbaijan', new SongDB('az', 'Azerbaijan')],
    ['Belarus', new SongDB('by', 'Belarus')],
    ['Belgium', new SongDB('be', 'Belgium')],
    ['Bosnia & Herzegovina', new SongDB('ba', 'Bosnia & Herzegovina')],
    ['Bulgaria', new SongDB('bg', 'Bulgaria')],
    ['Croatia', new SongDB('hr', 'Croatia')],
    ['Cyprus', new SongDB('cy', 'Cyprus')],
    ['Czechia', new SongDB('cz', 'Czechia')],
    ['Denmark', new SongDB('dk', 'Denmark')],
    ['Estonia', new SongDB('ee', 'Estonia')],
    ['Finland', new SongDB('fi', 'Finland')],
    ['France', new SongDB('fr', 'France')],
    ['Georgia', new SongDB('ge', 'Georgia')],
    ['Germany', new SongDB('de', 'Germany')],
    ['Gibraltar', new SongDB('gi', 'Gibraltar')],
    ['Greece', new SongDB('gr', 'Greece')],
    ['Hungary', new SongDB('hu', 'Hungary')],
    ['Iceland', new SongDB('is', 'Iceland')],
    ['Republic of Ireland', new SongDB('ie', 'Republic of Ireland')],
    ['Israel', new SongDB('il', 'Israel')],
    ['Italy', new SongDB('it', 'Italy')],
    ['Kosovo', new SongDB('xk', 'Kosovo')],
    ['Latvia', new SongDB('lv', 'Latvia')],
    ['Liechtenstein', new SongDB('li', 'Liechtenstein')],
    ['Luxembourg', new SongDB('lu', 'Luxembourg')],
    ['Lithuania', new SongDB('lt', 'Lithuania')],
    ['Malta', new SongDB('mt', 'Malta')],
    ['Moldova', new SongDB('md', 'Moldova')],
    ['Monaco', new SongDB('mc', 'Monaco')],
    ['Montenegro', new SongDB('me', 'Montenegro')],
    ['Morocco', new SongDB('ma', 'Morocco')],
    ['North Macedonia', new SongDB('mk', 'North Macedonia')],
    ['Norway', new SongDB('no', 'Norway')],
    ['Poland', new SongDB('pl', 'Poland')],
    ['Portugal', new SongDB('pt', 'Portugal')],
    ['Romania', new SongDB('ro', 'Romania')],
    ['Russia', new SongDB('ru', 'Russia')],
    ['San Marino', new SongDB('sm', 'San Marino')],
    ['Serbia', new SongDB('rs', 'Serbia')],
    ['Serbia & Montenegro', new SongDB('cs', 'Serbia & Montenegro')],
    ['Slovakia', new SongDB('sk', 'Slovakia')],
    ['Slovenia', new SongDB('si', 'Slovenia')],
    ['Spain', new SongDB('es', 'Spain')],
    ['Sweden', new SongDB('se', 'Sweden')],
    ['Switzerland', new SongDB('ch', 'Switzerland')],
    ['The Netherlands', new SongDB('nl', 'The Netherlands')],
    ['Turkey', new SongDB('tr', 'Turkey')],
    ['Ukraine', new SongDB('ua', 'Ukraine')],
    ['United Kingdom', new SongDB('gb', 'United Kingdom')],
    ['Yugoslavia', new SongDB('yu', 'Yugoslavia')],
  ]);

  songsArray: SongDB[];

  constructor(eventService: EventService) {
    this.songsArray = eventService.getActive().countries.map(c => this.getSong(c));
  }

  getSongs(): SongDB[] {
    return this.songsArray.slice();
  }

  getSongsMap(): Map<string, SongDB> {
    return this.songs;
  }

  getSong(country: string): SongDB {
    return this.songs.get(country) ?? new SongDB('', country);
  }

  setSongsMap(songs: Map<string, SongDB>): void {
    this.songs = songs;
  }

  setSongs(songs: SongDB[]): void {
    this.songsArray = songs;
  }

}
