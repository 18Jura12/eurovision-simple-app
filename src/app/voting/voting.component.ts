import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { DataStorageService } from '../shared/data-storage.service';
import { SongDB, VotingService } from './voting.service';

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
  voteForm: FormGroup;
  songs: SongDB[] = [
    {
      countryFlag: 'sm',
      countryName: 'San Marino',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'lt',
      countryName: 'Lithuania',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'md',
      countryName: 'Moldova',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'es',
      countryName: 'Spain',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'ru',
      countryName: 'Russia',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'is',
      countryName: 'Iceland',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'de',
      countryName: 'Germany',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'mk',
      countryName: 'North Macedonia',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'ge',
      countryName: 'Georgia',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'nl',
      countryName: 'The Netherlands',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'cy',
      countryName: 'Cyprus',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'al',
      countryName: 'Albania',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'fr',
      countryName: 'France',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'hr',
      countryName: 'Croatia',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'bg',
      countryName: 'Bulgaria',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'it',
      countryName: 'Italy',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'ie',
      countryName: 'Republic of Ireland',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'fi',
      countryName: 'Finland',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'be',
      countryName: 'Belgium',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'lv',
      countryName: 'Latvia',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'il',
      countryName: 'Israel',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'ch',
      countryName: 'Switzerland',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'ro',
      countryName: 'Romania',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'dk',
      countryName: 'Denmark',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'ua',
      countryName: 'Ukraine',
      points: { juco: 0, teco: 0 }
    },
    {
      countryFlag: 'gb',
      countryName: 'United Kingdom',
      points: { juco: 0, teco: 0 }
    },
  ];

  constructor(
    private router: Router,
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
  }

  initForm() {
    let votes = new FormArray([]);
    for(let i = 0; i < 26; ++i) {
      votes.push(
        // this.builder.group({
        //   vote:[null, RxwebValidators.required]
        // })
        new FormGroup({
          'vote': new FormControl(Validators.required, RxwebValidators.unique())
        })
      );
    }

    this.voteForm = new FormGroup({
      'votes': votes
    });
  }

  onSubmit() {
    this.dataStorageService.fetchContacts().subscribe(
      (resData: SongDB[]) => {
        for(let i = 0; i < 26; ++i) {
          if(this.login == 'juco') {
            resData[i].points.juco = this.songControls[i].value;
          } else {
            resData[i].points.teco = this.songControls[i].value;
          }
        }
        this.votingService.setSongs(resData);
        this.dataStorageService.storeContacts().subscribe();
        this.router.navigate(['/result']);
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

}
