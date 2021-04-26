import { Component, Directive, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { Song } from '../voting/voting.component';
import { SongDB, VotingService } from '../voting/voting.service';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.less']
})
export class ResultComponent implements OnInit, OnDestroy {
  songs: SongDB[] = [];
  songsOrder: SongDB[] = [];
  isLoading: boolean = false;
  private _shown: number = 0;
  isStart = false;
  sub: Subscription;
  source = interval(5000);

  constructor(
    private votingService: VotingService,
    private toastrService: ToastrService,
    private dataStorageService: DataStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.dataStorageService.fetchContacts().subscribe(
      resData => {
        this.isLoading = false;
        // console.log(resData);
        for(let res of resData) {
          this.songs.push(
            new SongDB(
              res.countryFlag,
              res.countryName,
              res.points
            )
          );
        }
        this.votingService.setSongs(this.songs);
        this.songsOrder = this.songs.slice();
        this.songs = this.sortResults();
        while(this.songs.length !== 10) {
          this.songs.pop();
        }
        this.songs = this.shuffle(this.songs);
      }
    );
  }

  sortResults() {
    return  _.orderBy(
      this.songs.slice(),
      [
        item => item.getTotal(),
        item => {
          let array = _.toArray(item.points);
          while(_.findIndex(array, e => e === 0) !== -1) {
            array.splice(array.indexOf(0), 1);
          }
          return _.min(array);
        },
        item => {
          let array = _.toArray(item.points);
          while(array.indexOf(0) !== -1) {
            array.splice(array.indexOf(0), 1);
          }
          return  _.countBy(array)[_.min(array)];
        },
        item => {
          let array = _.toArray(item.points);
          while(array.indexOf(0) !== -1) {
            array.splice(array.indexOf(0), 1);
          }
          let min = _.min(array);
          while(array.indexOf(min) !== -1) {
            array.splice(array.indexOf(min), 1);
          }
          return _.min(array);
        },
        item => {
          let array = _.toArray(item.points);
          while(array.indexOf(0) !== -1) {
            array.splice(array.indexOf(0), 1);
          }
          let min = _.min(array);
          while(array.indexOf(min) !== -1) {
            array.splice(array.indexOf(min), 1);
          }
          return _.countBy(array)[_.min(array)];
        }
      ]
    );
  }

  shuffle(array: SongDB[]) {
    var currentIndex = array.length;
    var temporaryValue: SongDB;
    var randomIndex: number;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  placement(song: SongDB) {
    let array = this.songs.slice();
    while(array.length !== this.shown) {
      array.pop();
    }
    let style = '';
    if(array.indexOf(song) !== -1) {
      style = 'rgba(255, 215, 0, 0.8)';
    } else {
      style = 'rgba(170, 247, 250, 0.8)';
    }
    return style;
  }

  onVote() {
    this.router.navigate(['login']);
  }

  onStart() {
    if(this.sub) {
      this.sub.unsubscribe();
    }
    this.isStart = !this.isStart;
    if(this.isStart) {
      this.sub = this.source.subscribe(
        val => {
          this.shown++;
        }
      );
    }
  }

  get shown(): number {
    return this._shown;
  }

  set shown(value: number) {
    if(value !== this._shown) {
      this._shown = value;
      switch(value) {
        case 5:
          this.source = interval(8000);
          this.sub.unsubscribe();
          this.sub = this.source.subscribe(
            val => {this.shown++;});
          break;
        case 7:
          this.source = interval(10000);
          this.sub.unsubscribe();
          this.sub = this.source.subscribe(
            val => {this.shown++;});
          break;
        case 9:
          this.source = interval(15000);
          this.sub.unsubscribe();
          this.sub = this.source.subscribe(
            val => { this.shown++; });
          break;
        case 10:
          if(this.sub) {
            this.sub.unsubscribe();
          }
      }
    }
  }

  onReset() {
    if(this.sub) {
      this.sub.unsubscribe();
      this.isStart = false;
    }
    this.shown = 0;
  }

  allVoted(): boolean {
    let array = this.songs[0].votes;
    for(let vote of array) {
      if(vote[1] === 0) {
        return true;
      }
    }
    return true;
  }

  ngOnDestroy() {
    if(this.sub) {
      this.sub.unsubscribe();
    }
  }

}
