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
    new SongDB('al' , 'Albania'),
    new SongDB('lv' , 'Latvia'),
    new SongDB('lt' , 'Lithuania'),
    new SongDB('ch' , 'Switzerland'),
    new SongDB('si' , 'Slovenia'),
    new SongDB('ua' , 'Ukraine'),
    new SongDB('bg' , 'Bulgaria'),
    new SongDB('nl' , 'The Netherlands'),
    new SongDB('md' , 'Moldova'),
    new SongDB('pt' , 'Portugal'),
    new SongDB('hr' , 'Croatia'),
    new SongDB('dk' , 'Denmark'),
    new SongDB('at' , 'Austria'),
    new SongDB('is' , 'Iceland'),
    new SongDB('gr' , 'Greece'),
    new SongDB('no' , 'Norway'),
    new SongDB('am' , 'Armenia')
  ];

  getSongs() {
    return this.songs.slice();
  }

  setSongs(songs: SongDB[]) {
    this.songs = songs;
    //this.voted.next();
  }

}
