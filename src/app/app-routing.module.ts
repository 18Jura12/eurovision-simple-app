import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginGuard } from './login/login.guard';
import { ResultComponent } from './result/result.component';
import { VotingComponent } from './voting/voting.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'result', component: ResultComponent },
  { path: 'vote', component: VotingComponent, canActivate: [LoginGuard] },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
