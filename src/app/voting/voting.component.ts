import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { DataStorageService } from '../shared/data-storage.service';
import { SongDB, VotingService } from './voting.service';
import * as _ from 'lodash-es';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../login/login.service';

export class Song {
  constructor(
    public countryFlag: string,
    public countryName: string
  ) {}
}

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.less']
})
export class VotingComponent implements OnInit {
  login!: string;
  isLoading = false;
  voteForm!: UntypedFormGroup;

  songs: SongDB[];

  constructor(
    private router: Router,
    private toastrService: ToastrService,
    votingService: VotingService,
    private dataStorageService: DataStorageService,
    private loginService: LoginService
  ) {
    this.songs = votingService.getSongs();
  }

  ngOnInit(): void {
    this.login = this.loginService.getUser()!;
    this.isLoading = true;
    this.dataStorageService.fetchUserVotes(this.login).subscribe(
      (votes) => {
        this.isLoading = false;
        if (votes !== null) {
          this.toastrService.warning('You have already voted!');
          this.router.navigate(['/result']);
          return;
        }
        this.initForm();
        this.toastrService.info('Drag items in order from first(1) to last(' + this.songs.length + ')');
      }
    );
  }

  initForm(): void {
    const votes = new UntypedFormArray([]);
    for(let i = 0; i < this.songs.length; ++i) {
      votes.push(
        new UntypedFormGroup({
          vote: new UntypedFormControl(
            +i+1,
            [
              Validators.required,
              Validators.max(this.songs.length),
              Validators.min(1),
              RxwebValidators.unique()
            ]
          )
        })
      );
    }

    this.voteForm = new UntypedFormGroup({
      'votes': votes
    });
  }

  onSubmit() {
    this.isLoading = true;
    const votes: {[country: string]: number} = {};
    for(let i = 0; i < this.songs.length; ++i) {
      votes[this.songs[i].countryName] = this.songControls[i].get('vote')!.value;
    }
    this.dataStorageService.storeVotes(this.login, votes).subscribe(
      () => {
        this.isLoading = false;
        this.router.navigate(['/result']);
      }
    );
  }

  get songControls() {
    return (this.voteForm.get('votes') as UntypedFormArray).controls;
  }

  getSongDetails(i: number): Song {
    return new Song(
      this.songs[i].countryFlag,
      this.songs[i].countryName
    );
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.songs, event.previousIndex, event.currentIndex);
  }

  setClass(i: number): string {
    return i < 10 ? 'nameQ' : 'nameNQ';
  }

}
