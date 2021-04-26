import { Injectable, Output } from "@angular/core";
import * as _ from 'lodash';

export class SongDB {
  constructor(
    public countryFlag: string,
    public countryName: string,
    public points?: {
      johnny: number,
      juco: number,
      lea: number,
      matija: number,
      renato: number,
      teco: number
    }
  ) {
    if(points === undefined) {
      this.points =
    {
      johnny: 0,
      juco: 0,
      lea: 0,
      matija: 0,
      renato: 0,
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
    new SongDB('lt' , 'Lithuania'),
    new SongDB('si' , 'Slovenia'),
    new SongDB('ru' , 'Russia'),
    new SongDB('se' , 'Sweden'),
    new SongDB('au' , 'Australia'),
    new SongDB('mk' , 'North Macedonia'),
    new SongDB('ie' , 'Ireland'),
    new SongDB('cy' , 'Cyprus'),
    new SongDB('no' , 'Norway'),
    new SongDB('hr' , 'Croatia'),
    new SongDB('be' , 'Belgium'),
    new SongDB('il' , 'Israel'),
    new SongDB('ro' , 'Romania'),
    new SongDB('az' , 'Azerbaijan'),
    new SongDB('ua' , 'Ukraine'),
    new SongDB('mt' , 'Malta')
  ];

  getSongs() {
    return this.songs.slice();
  }

  setSongs(songs: SongDB[]) {
    this.songs = songs;
    //this.voted.next();
  }

}
