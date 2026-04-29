import { Component, Directive, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { SongDB, VotingService } from '../voting/voting.service';
import * as _ from 'lodash-es';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { EventService } from '../shared/event.service';

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
  jury: boolean = false;
  songs: SongDB[] = [];
  songsOrder: SongDB[] = [];
  songsOrder1: SongDB[] = [];
  isLoading: boolean = false;
  private _shown: number = 0;
  isStart = false;
  sub!: Subscription;
  source = interval(5000);
  table: boolean = false;
  isFinal: boolean;

  constructor(
    private votingService: VotingService,
    private dataStorageService: DataStorageService,
    private router: Router,
    private eventService: EventService
  ) {
    const event = this.eventService.getActive().event;
    this.isFinal = event === 'Final' || event === 'AllSongs';
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.dataStorageService.fetchAllVotes().subscribe(
      allVotes => {
        this.isLoading = false;
        const users = Object.keys(allVotes || {});
        const songList = this.votingService.getSongs();
        for(let song of songList) {
          const points: {[key: string]: number} = {};
          for(let user of users) {
            points[user] = allVotes![user][song.countryName] ?? 0;
          }
          this.songs.push(new SongDB(song.countryFlag, song.countryName, points));
        }
        this.votingService.setSongs(this.songs);
        this.songsOrder = this.songs.slice();
        this.songsOrder1 = this.songsOrder.slice();
        this.songs = this.sortResults();

        if (this.isFinal) {
          // All countries, sorted, no shuffle — countdown from full count
          this._shown = this.songs.length;
          this.source = interval(2000);
        } else {
          // SF: top 10 shuffled, count up from 0
          while(this.songs.length > 10) {
            this.songs.pop();
          }
          this.songs = this.shuffle(this.songs);
        }
      }
    );
  }

  @ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader>;

  onSort({column, direction}: SortEvent) {
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

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
            return  _.countBy(array)[_.min(array)!.toString()];
          },
          item => {
            let array = _.toArray(item.points);
            while(array.indexOf(0) !== -1) {
              array.splice(array.indexOf(0), 1);
            }
            let min = _.min(array);
            while(array.indexOf(min!) !== -1) {
              array.splice(array.indexOf(min!), 1);
            }
            return array.length ? _.min(array) : 0;
          },
          item => {
            let array = _.toArray(item.points);
            while(array.indexOf(0) !== -1) {
              array.splice(array.indexOf(0), 1);
            }
            let min = _.min(array);
            while(array.indexOf(min!) !== -1) {
              array.splice(array.indexOf(min!), 1);
            }
            return array.length ? _.countBy(array)[_.min(array)!.toString()] : 0;
          }
        ],
        [direction]);
    } else {
      this.songsOrder = _.orderBy(
        this.songsOrder,
        item => item.points![column],
        [direction]
      );
    }
  }

  sortResults() {
    return  _.orderBy(
      this.songsOrder.slice(),
      [
        this.jury === true ?
        item => item.getExpWeightTotal() ** (+(-1)) :
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
          return  _.countBy(array)[_.min(array)!.toString()];
        },
        item => {
          let array = _.toArray(item.points);
          while(array.indexOf(0) !== -1) {
            array.splice(array.indexOf(0), 1);
          }
          let min = _.min(array);
          while(array.indexOf(min!) !== -1) {
            array.splice(array.indexOf(min!), 1);
          }
          return array.length ? _.min(array) : 0;
        },
        item => {
          let array = _.toArray(item.points);
          while(array.indexOf(0) !== -1) {
            array.splice(array.indexOf(0), 1);
          }
          let min = _.min(array);
          while(array.indexOf(min!) !== -1) {
            array.splice(array.indexOf(min!), 1);
          }
          return array.length ? _.countBy(array)[_.min(array)!.toString()] : 0;
        }
      ]
    );
  }

  shuffle(array: SongDB[]) {
    var currentIndex = array.length;
    var temporaryValue: SongDB;
    var randomIndex: number;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  placement(song: SongDB) {
    if (this.isFinal) {
      const rank = this.sortResults().indexOf(song);
      if (rank === 0) return 'rgba(255, 215, 0, 0.85)';
      if (rank === 1) return 'rgba(220, 220, 220, 0.85)';
      if (rank === 2) return 'rgba(195, 137, 60, 0.75)';
      if (rank < 10) return 'rgba(255, 215, 0, 0.15)';
      return 'rgba(18, 6, 60, 0.6)';
    }
    let array = this.songs.slice();
    while(array.length !== this.shown) {
      array.pop();
    }
    return array.indexOf(song) !== -1 ? 'rgba(230, 0, 126, 0.22)' : 'rgba(18, 6, 60, 0.6)';
  }

  setColour(song: SongDB) {
    if (this.isFinal) {
      const rank = this.sortResults().indexOf(song);
      if (rank < 3) return 'tdQMedal';
      if (rank < 10) return 'tdQ';
      return 'tdNQ';
    }
    let array = this.songs.slice();
    while(array.length !== this.shown) {
      array.pop();
    }
    return array.indexOf(song) !== -1 ? 'tdQ' : 'tdNQ';
  }

  color(vote: number): string {
    if(vote === 1) return 'gold';
    if(vote === 2) return 'rgb(250, 250, 250)';
    if(vote === 3) return '#CD7F32';
    if(this.isFinal && vote <= 10) return '#0099FF';
    return '';
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
      if (this.isFinal) {
        this.shown--;
        this.sub = this.source.subscribe(_ => { this.shown--; });
      } else {
        this.sub = this.source.subscribe(_ => { this.shown++; });
      }
    }
  }

  get shown(): number {
    return this._shown;
  }

  set shown(value: number) {
    if(value !== this._shown) {
      this._shown = value;
      if (this.isFinal) {
        switch(value) {
          case 15:
            this.source = interval(5000);
            this.sub.unsubscribe();
            this.sub = this.source.subscribe(_ => { this.shown--; });
            break;
          case 10:
            this.source = interval(10000);
            this.sub.unsubscribe();
            this.sub = this.source.subscribe(_ => { this.shown--; });
            break;
          case 5:
            this.source = interval(15000);
            this.sub.unsubscribe();
            this.sub = this.source.subscribe(_ => { this.shown--; });
            break;
          case 1:
            this.source = interval(1000);
            this.sub.unsubscribe();
            this.sub = this.source.subscribe(_ => { this.shown--; });
            break;
          case 0:
            if(this.sub) { this.sub.unsubscribe(); }
            this.isStart = false;
        }
      } else {
        switch(value) {
          case 5:
            this.source = interval(8000);
            this.sub.unsubscribe();
            this.sub = this.source.subscribe(_ => {this.shown++;});
            break;
          case 7:
            this.source = interval(10000);
            this.sub.unsubscribe();
            this.sub = this.source.subscribe(_ => {this.shown++;});
            break;
          case 9:
            this.source = interval(15000);
            this.sub.unsubscribe();
            this.sub = this.source.subscribe(_ => { this.shown++; });
            break;
          case 10:
            if(this.sub) { this.sub.unsubscribe(); }
        }
      }
    }
  }

  onReset() {
    if(this.sub) {
      this.sub.unsubscribe();
      this.isStart = false;
    }
    this.songsOrder = this.sortResults();
    this.headers.forEach(h => h.direction = '');
    this.shown = this.isFinal ? this.songs.length : 0;
  }

  onTable() {
    this.table = !this.table;
    this.shown = 10;
    this.isStart = false;
  }

  onJury() {
    this.jury = !this.jury;
    if (this.isFinal) {
      this.songsOrder = this.sortResults();
      this.songs = this.songsOrder.slice();
    } else {
      this.songs = this.sortResults();
    }
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
