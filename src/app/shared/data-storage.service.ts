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
      'https://angular-project-58125-default-rtdb.firebaseio.com/songs.json',
      contacts
    );
  }

  fetchContacts() {
    return this.http.get<SongDB[]>(
      'https://angular-project-58125-default-rtdb.firebaseio.com/songs.json'
    );
  }

}
