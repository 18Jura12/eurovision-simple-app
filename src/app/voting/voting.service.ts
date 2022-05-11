import { Injectable, Output } from "@angular/core";
import * as _ from 'lodash';

export class SongDB {
  constructor(
    public countryFlag: string,
    public countryName: string,
    public points?: {
      johnny: number,
      juco: number,
      nika: number,
      lucija: number,
      matija: number,
      marko: number,
      teco: number
    }
  ) {
    if(points === undefined) {
      this.points =
    {
      johnny: 0,
      juco: 0,
      nika: 0,
      lucija: 0,
      matija: 0,
      marko: 0,
      teco: 0
    };
    }
  }

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
    new SongDB('fi' , 'Finland'),
    new SongDB('il' , 'Israel'),
    new SongDB('rs' , 'Serbia'),
    new SongDB('az' , 'Azerbaijan'),
    new SongDB('ge' , 'Georgia'),
    new SongDB('mt' , 'Malta'),
    new SongDB('sm' , 'San Marino'),
    new SongDB('au' , 'Australia'),
    new SongDB('cy' , 'Cyprus'),
    new SongDB('ie' , 'Republic of Ireland'),
    new SongDB('mk' , 'North Macedonia'),
    new SongDB('ee' , 'Estonia'),
    new SongDB('ro' , 'Romania'),
    new SongDB('pl' , 'Poland'),
    new SongDB('me' , 'Montenegro'),
    new SongDB('be' , 'Belgium'),
    new SongDB('se' , 'Sweden'),
    new SongDB('cz' , 'Czechia')
  ];

  getSongs() {
    return this.songs.slice();
  }

  setSongs(songs: SongDB[]) {
    this.songs = songs;
    //this.voted.next();
  }

}
