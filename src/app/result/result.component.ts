import { Component, OnInit } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { SongDB } from '../voting/voting.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.less']
})
export class ResultComponent implements OnInit {
  songs: SongDB[] = [];

  constructor(
    private dataStorageService: DataStorageService
  ) { }

  ngOnInit(): void {
    this.dataStorageService.fetchContacts().subscribe(
      resData => {
        this.songs = resData;
      }
    );
  }

}
