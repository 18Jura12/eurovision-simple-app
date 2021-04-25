import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { tap } from 'rxjs/operators';
import { SongDB, VotingService } from "../voting/voting.service";

@Injectable({providedIn: 'root'})
export class DataStorageService {

  constructor(
    private http: HttpClient,
    private votingService: VotingService
  ) {}

  storeContacts() {
    const contacts = this.votingService.getSongs();
    return this.http.put(
      'https://sm-euro-default-rtdb.europe-west1.firebasedatabase.app/songs.json',
      contacts
    );
  }

  fetchContacts() {
    return this.http.get<SongDB[]>(
      'https://sm-euro-default-rtdb.europe-west1.firebasedatabase.app/songs.json'
    );
  }

}
