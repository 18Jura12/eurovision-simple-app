import { Injectable, Output } from "@angular/core";
import * as _ from 'lodash';

export class SongDB {
  constructor(
    public countryFlag: string,
    public countryName: string,
    public points: {
      johnny: number,
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
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'cz', 'Czechia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'nl', 'The Netherlands',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'az', 'Azerbaijan',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'hu', 'Hungary',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'it', 'Italy',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'il', 'Israel',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'bg', 'Bulgaria',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'se', 'Sweden',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'de', 'Germany',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'fr', 'France',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'pl', 'Poland',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'au', 'Australia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'cy', 'Cyprus',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'rs', 'Serbia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'lt', 'Lithuania',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'hr', 'Croatia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'ru', 'Russia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'es', 'Spain',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'lv', 'Latvia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'ua', 'Ukraine',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'mt', 'Malta',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'ge', 'Georgia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'at', 'Austria',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'gb', 'United Kingdom',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'am', 'Armenia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
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
