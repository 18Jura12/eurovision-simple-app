import { Component, Directive, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { Song } from '../voting/voting.component';
import { SongDB, VotingService } from '../voting/voting.service';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

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
export class ResultComponent implements OnInit {
  songs: SongDB[] = [];
  songsOrder: SongDB[] = [];
  isLoading: boolean = false;

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
      }
    );
    this.toastrService.info('sort by taping the column header');
  }

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  onSort({column, direction}: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    if (direction === '' || column === '') {
      this.songs = this.sortResults();
    } else if(column === 'order'){
      this.songs = direction === 'asc' ?
        this.songsOrder.slice() : this.songsOrder.slice().reverse();
    } else if(column === 'name'){
      this.songs = _.orderBy(
        this.songs, 'countryName', [direction]);
    } else if(column === 'result') {
      this.songs = _.orderBy(
        this.songs,
        [
          item => item.getTotal(),
          item => _.min(_.toArray(item.points))
        ],
        [direction]);
    } else {
      this.songs = _.orderBy(
        this.songs,
        item => item.points[column],
        [direction]
      );
    }
  }

  sortResults() {
    return _.orderBy(
      this.songs.slice(),
      [
        item => item.getTotal(),
        item => _.min(_.toArray(item.points))
      ]);
  }

  placement(song: SongDB) {
    let array = this.sortResults();
    let style = '';
    if(array[0] === song) {
      style = 'rgba(255, 215, 0, 0.8)';
    } else if(array[1] == song) {
      style = 'rgba(231, 231, 231, 0.8)';
    } else if(array[2] == song) {
      style = 'rgba(195, 137, 60, 0.8)';
    } else {
      style = 'rgba(170, 247, 250, 0.8)';
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

}
