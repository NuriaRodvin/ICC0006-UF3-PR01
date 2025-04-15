import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgIf, NgForOf } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scores',
  standalone: true,
  imports: [IonicModule, NgIf, NgForOf, CommonModule],
  templateUrl: './scores.page.html',
  styleUrls: ['./scores.page.scss'],
})
export class ScoresPage {
  scores: { name: string; score: number }[] = [];

  constructor(private router: Router) {}

  ionViewWillEnter() {
    const stored = localStorage.getItem('scores');

    console.log('✅ Scores desde localStorage:', stored);

    if (stored) {
      try {
        this.scores = JSON.parse(stored);
        this.scores.sort((a, b) => b.score - a.score);
      } catch (error) {
        console.error('❌ Error al parsear scores:', error);
        this.scores = [];
      }
    } else {
      this.scores = [];
    }
  }

  volverInicio() {
    this.router.navigateByUrl('/pages/home');
  }

  reiniciarPartida() {
    this.router.navigateByUrl('/pages/game');
  }
}
