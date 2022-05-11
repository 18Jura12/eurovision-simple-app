import { Component, Directive, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { Song } from '../voting/voting.component';
import { SongDB, VotingService } from '../voting/voting.service';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

export type SortColumn = string;
export type SortDirection = 'asc' | 'desc' | '';
const rotate: {[key: string]: SortDirection} = { 'asc': 'desc', 'desc': '', '': 'asc' };

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()'
  }
})
export class NgbdSortableHeader {

  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({column: this.sortable, direction: this.direction});
  }
}

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.less']
})
export class ResultComponent implements OnInit, OnDestroy {
  songs: SongDB[] = [];
  songsOrder: SongDB[] = [];
  songsOrder1: SongDB[] = [];
  isLoading: boolean = false;
  private _shown: number = 0;
  isStart = false;
  sub: Subscription;
  source = interval(5000);
  table: boolean = false;

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
        //console.log(resData);
        for(let res of resData) {
          this.songs.push(
            new SongDB(
              res.countryFlag,
              res.countryName,
              res.points
            )
          );
        }
        //console.log(this.songs);
        this.votingService.setSongs(this.songs);
        this.songsOrder = this.songs.slice();
        this.songsOrder1 = this.songsOrder.slice();
        this.songs = this.sortResults();
        while(this.songs.length !== 10) {
          this.songs.pop();
        }
        this.songs = this.shuffle(this.songs);
      }
    );
  }

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  onSort({column, direction}: SortEvent) {

    //console.log(column + direction);
    // resetting other headers
    this.headers.forEach(header => {
      //console.log(header);
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    if (direction === '' || column === '') {
      this.songsOrder = this.sortResults();
    } else if(column === 'order'){
      this.songsOrder = direction === 'asc' ?
        this.songsOrder1.slice() : this.songsOrder1.slice().reverse();
    } else if(column === 'name'){
      this.songsOrder = _.orderBy(
        this.songsOrder, 'countryName', [direction]);
    } else if(column === 'result') {
      this.songsOrder = _.orderBy(
        this.songsOrder,
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
        ],
        [direction]);
    } else {
      this.songsOrder = _.orderBy(
        this.songsOrder,
        item => item.points[column],
        [direction]
      );
    }
  }

  sortResults() {
    return  _.orderBy(
      this.songsOrder.slice(),
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
    while(array.length !== this.shown && !this.table) {
      array.pop();
    }
    let style = '';
    if(array.indexOf(song) !== -1 ) {
      style = 'rgba(255, 215, 0, 0.8)';
    } else {
      style = 'rgba(200, 0, 0, 0.6)';
    }
    return style;
  }

  color(vote: number) {
    let style = '';
    if(vote === 1) {
      style = 'gold';
    } else if(vote == 2) {
      style = 'rgb(250, 250, 250)';
    } else if(vote == 3) {
      style = '#CD7F32';
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
