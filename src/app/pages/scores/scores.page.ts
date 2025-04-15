import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-scores',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './scores.page.html',
  styleUrls: ['./scores.page.scss'],
})
export class ScoresPage {
  scores: { name: string; score: number }[] = [];

  constructor(private router: Router) {}

  ionViewWillEnter() {
    const stored = localStorage.getItem('scores');
    this.scores = stored ? JSON.parse(stored) : [];
    this.scores.sort((a, b) => b.score - a.score);
  }

  volverInicio() {
    this.router.navigateByUrl('/pages/home');
  }

  reiniciarPartida() {
    this.router.navigateByUrl('/pages/game');
  }
}


