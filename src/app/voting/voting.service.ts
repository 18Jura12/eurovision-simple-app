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
    new SongDB('sm' , 'San Marino'),
    new SongDB('ee' , 'Estonia'),
    new SongDB('cz' , 'Czechia'),
    new SongDB('gr' , 'Greece'),
    new SongDB('at' , 'Austria'),
    new SongDB('pl' , 'Poland'),
    new SongDB('md' , 'Moldova'),
    new SongDB('is' , 'Iceland'),
    new SongDB('rs' , 'Serbia'),
    new SongDB('ge' , 'Georgia'),
    new SongDB('al' , 'Albania'),
    new SongDB('pt' , 'Portugal'),
    new SongDB('bg' , 'Bulgaria'),
    new SongDB('fi' , 'Finland'),
    new SongDB('lv' , 'Latvia'),
    new SongDB('ch' , 'Switzerland'),
    new SongDB('dk' , 'Denmark')
  ];

  getSongs() {
    return this.songs.slice();
  }

  setSongs(songs: SongDB[]) {
    this.songs = songs;
    //this.voted.next();
  }

}
