import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { DataStorageService } from '../shared/data-storage.service';
import { SongDB, VotingService } from './voting.service';
import * as _ from 'lodash';
import { Toast, ToastrService } from 'ngx-toastr';

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
  login: string;
  isLoading: boolean = false;
  voteForm: FormGroup;
  songs: SongDB[] = [
    new SongDB(
      'be' , 'Belgium',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'cz', 'Czechia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'nl', 'The Netherlands',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'az', 'Azerbaijan',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'hu', 'Hungary',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'it', 'Italy',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'il', 'Israel',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'bg', 'Bulgaria',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'se', 'Sweden',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'de', 'Germany',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'fr', 'France',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'pl', 'Poland',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'au', 'Australia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'cy', 'Cyprus',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'rs', 'Serbia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'lt', 'Lithuania',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'hr', 'Croatia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'ru', 'Russia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'es', 'Spain',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'lv', 'Latvia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'ua', 'Ukraine',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'mt', 'Malta',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'ge', 'Georgia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'at', 'Austria',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'gb', 'United Kingdom',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    ),
    new SongDB(
      'am', 'Armenia',
      {
        johnny: 0, juco: 0, lea: 0, matija: 0, renato: 0, teco: 0
      }
    )
  ];

  constructor(
    private router: Router,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private builder: FormBuilder,
    private votingService: VotingService,
    private dataStorageService: DataStorageService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this.login = params['id'];
        this.initForm();
      }
    );
    // this.dataStorageService.storeContacts().subscribe(
    //   // resData => console.log(resData)
    // );
    this.toastrService.info('Drag items in order from first(1) to last(26)');
  }

  initForm() {
    let votes = new FormArray([]);
    for(let i = 0; i < 26; ++i) {
      votes.push(
        // this.builder.group({
        //   vote:[null, RxwebValidators.required]
        // })
        new FormGroup({
          'vote': new FormControl(+i+1, [Validators.required, Validators.max(26), Validators.min(1), RxwebValidators.unique()])
        })
      );
    }

    this.voteForm = new FormGroup({
      'votes': votes
    });
  }

  onSubmit() {
    this.isLoading = true;
    this.dataStorageService.fetchContacts().subscribe(
      (resData: SongDB[]) => {
        for(let i = 0; i < 26; ++i) {
          // if(this.login == 'juco') {
          //   resData[i].points.juco = this.songControls[i].value;
          // } else {
          //   resData[i].points.maco = this.songControls[i].value;
          // }
          let j = _.findIndex(resData, item => { return item.countryName === this.songs[i].countryName });
          switch (this.login) {
            case 'juco':
              resData[j].points.juco = this.songControls[i].get('vote').value;
              break;
            case 'lea':
              resData[j].points.lea = this.songControls[i].get('vote').value;
              break;
            case 'matija':
              resData[j].points.matija = this.songControls[i].get('vote').value;
              break;
            case 'renato':
              resData[j].points.renato = this.songControls[i].get('vote').value;
              break;
            case 'teco':
              resData[j].points.teco = this.songControls[i].get('vote').value;
              break;
            default:
              break;
          }
        }
        this.votingService.setSongs(resData);
        this.dataStorageService.storeContacts().subscribe(
          () => {
            this.isLoading = false;
            this.router.navigate(['/result']);
          }
        );
      }
    );
  }

  get songControls() {
    return (this.voteForm.get('votes') as FormArray).controls;
  }

  getSongDetails(i: number): Song {
    return new Song(
      this.songs[i].countryFlag,
      this.songs[i].countryName
    )
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.songs, event.previousIndex, event.currentIndex);
  }

}
