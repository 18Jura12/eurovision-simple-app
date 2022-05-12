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
    new SongDB('fi' , 'Finland'),
    new SongDB('il' , 'Israel'),
    new SongDB('rs' , 'Serbia'),
    new SongDB('az' , 'Azerbaijan'),
    new SongDB('ge' , 'Georgia'),
    new SongDB('mt' , 'Malta'),
    new SongDB('sm' , 'San Marino'),
    new SongDB('au' , 'Australia'),
    new SongDB('cy' , 'Cyprus'),
    new SongDB('ie' , 'Republic of Ireland'),
    new SongDB('mk' , 'North Macedonia'),
    new SongDB('ee' , 'Estonia'),
    new SongDB('ro' , 'Romania'),
    new SongDB('pl' , 'Poland'),
    new SongDB('me' , 'Montenegro'),
    new SongDB('be' , 'Belgium'),
    new SongDB('se' , 'Sweden'),
    new SongDB('cz' , 'Czechia')
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
    this.toastrService.info('Drag items in order from first(1) to last(18)');
  }

  initForm() {
    let votes = new FormArray([]);
    for(let i = 0; i < 18; ++i) {
      votes.push(
        // this.builder.group({
        //   vote:[null, RxwebValidators.required]
        // })
        new FormGroup({
          'vote': new FormControl(+i+1, [Validators.required, Validators.max(18), Validators.min(1), RxwebValidators.unique()])
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
        for(let i = 0; i < 18; ++i) {
          // if(this.login == 'juco') {
          //   resData[i].points.juco = this.songControls[i].value;
          // } else {
          //   resData[i].points.maco = this.songControls[i].value;
          // }
          let j = _.findIndex(resData, item => { return item.countryName === this.songs[i].countryName });
          switch (this.login) {
            case 'johnny':
              resData[j].points.johnny = this.songControls[i].get('vote').value;
              break;
            case 'juco':
              resData[j].points.juco = this.songControls[i].get('vote').value;
              break;
            case 'nika':
              resData[j].points.nika = this.songControls[i].get('vote').value;
              break;
            case 'lucija':
              resData[j].points.lucija = this.songControls[i].get('vote').value;
              break;
            case 'matija':
              resData[j].points.matija = this.songControls[i].get('vote').value;
              break;
            case 'marko':
              resData[j].points.marko = this.songControls[i].get('vote').value;
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

  setClass(i: number) {
    return i < 10 ? 'nameQ' : 'nameNQ';
  }

}
