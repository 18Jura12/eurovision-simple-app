import { Injectable, Output } from "@angular/core";
import * as _ from 'lodash';

export class SongDB {
  constructor(
    public countryFlag: string,
    public countryName: string,
    public points: {
      juco: number,
      lea: number,
      matija: number,
      renato: number,
      teco: number
    }
  ) {}

  getTotal() {
    return _.sum(_.values(this.points));
  }

  get votes() {
    return Object.entries(this.points);
  }
}

@Injectable({providedIn: 'root'})
export class VotingService {
  //@Output() voted = new Subject<string>();
  songs: SongDB[] = [
    new SongDB(
      'be' , 'Belgium',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'cz', 'Czechia',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'nl', 'The Netherlands',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'az', 'Azerbaijan',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'hu', 'Hungary',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'it', 'Italy',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'il', 'Israel',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'bg', 'Bulgaria',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'se', 'Sweden',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'de', 'Germany',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'fr', 'France',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'pl', 'Poland',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'au', 'Australia',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'cy', 'Cyprus',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'rs', 'Serbia',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'lt', 'Lithuania',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'hr', 'Croatia',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'ru', 'Russia',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'es', 'Spain',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'lv', 'Latvia',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'ua', 'Ukraine',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'mt', 'Malta',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'ge', 'Georgia',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'at', 'Austria',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'gb', 'United Kingdom',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'am', 'Armenia',
      {
        juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    )
  ];

  getSongs() {
    return this.songs.slice();
  }

  setSongs(songs: SongDB[]) {
    this.songs = songs;
    //this.voted.next();
  }

}
