import { Injectable, Output } from "@angular/core";
import { Subject } from "rxjs/internal/Subject";

export class SongDB {
  constructor(
    public countryFlag: string,
    public countryName: string,
    public points: {
      juco: number,
      teco: number
    }
  ) {}
}

@Injectable({providedIn: 'root'})
export class VotingService {
  //@Output() voted = new Subject<string>();
  songs: SongDB[] = [
    {
      countryFlag: 'sm',
      countryName: 'San Marino',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'lt',
      countryName: 'Lithuania',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'md',
      countryName: 'Moldova',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'es',
      countryName: 'Spain',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'ru',
      countryName: 'Russia',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'is',
      countryName: 'Iceland',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'de',
      countryName: 'Germany',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'mk',
      countryName: 'North Macedonia',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'ge',
      countryName: 'Georgia',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'nl',
      countryName: 'The Netherlands',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'cy',
      countryName: 'Cyprus',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'al',
      countryName: 'Albania',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'fr',
      countryName: 'France',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'hr',
      countryName: 'Croatia',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'bg',
      countryName: 'Bulgaria',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'it',
      countryName: 'Italy',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'ie',
      countryName: 'Republic of Ireland',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'fi',
      countryName: 'Finland',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'be',
      countryName: 'Belgium',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'lv',
      countryName: 'Latvia',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'il',
      countryName: 'Israel',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'ch',
      countryName: 'Switzerland',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'ro',
      countryName: 'Romania',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'dk',
      countryName: 'Denmark',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'ua',
      countryName: 'Ukraine',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'gb',
      countryName: 'United Kingdom',
      points: { juco: 0, teco: 0 }
    },
  ];

  getSongs() {
    return this.songs.slice();
  }

  setSongs(songs: SongDB[]) {
    this.songs = songs;
    //this.voted.next();
  }

}
