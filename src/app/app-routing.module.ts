import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { MoodAnalysisComponent } from './mood-analysis/mood-analysis.component';
import { MoodHomeComponent } from './mood-home/mood-home.component';

const routes: Routes = [
  { path: '', component: MoodHomeComponent},
  { path: 'callback', component: MoodAnalysisComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }