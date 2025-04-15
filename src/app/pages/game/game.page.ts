import { Component, AfterViewInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import Phaser from 'phaser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements AfterViewInit {
  game!: Phaser.Game;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 320,
      height: 480,
      parent: 'game-container',
      scene: MainScene,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
    };

    this.game = new Phaser.Game(config);

    // ⏱ Simulación de fin de partida tras 5 segundos
    setTimeout(() => {
      const nombre = localStorage.getItem('nombreJugador') || 'Piloto desconocido';
      const puntuacion = Math.floor(Math.random() * 100); // puntuación aleatoria simulada

      const almacenadas = localStorage.getItem('scores');
      const scores = almacenadas ? JSON.parse(almacenadas) : [];

      scores.push({ name: nombre, score: puntuacion });
      localStorage.setItem('scores', JSON.stringify(scores));

      console.log('✅ Nueva puntuación guardada:', { name: nombre, score: puntuacion });

      this.router.navigateByUrl('/pages/scores');
    }, 5000);
  }

  goHome() {
    this.router.navigateByUrl('/pages/home');
  }

  restartGame() {
    this.game.destroy(true);
    this.ngAfterViewInit();
  }

  goToScores() {
    this.router.navigateByUrl('/pages/scores');
  }
}

class MainScene extends Phaser.Scene {
  nave!: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    this.load.image('fondo', 'assets/img/fondo.png');
    this.load.image('nave', 'assets/img/nave.png');
  }

  create(): void {
    this.add.image(0, 0, 'fondo').setOrigin(0);
    this.nave = this.physics.add.sprite(160, 450, 'nave');
    this.nave.setCollideWorldBounds(true);
    this.input.keyboard?.createCursorKeys();
  }

  override update(): void {
    if (!this.input.keyboard) return;

    const cursors = this.input.keyboard.createCursorKeys();
    this.nave.setVelocity(0);

    if (cursors.left?.isDown) {
      this.nave.setVelocityX(-200);
    } else if (cursors.right?.isDown) {
      this.nave.setVelocityX(200);
    }

    if (cursors.up?.isDown) {
      this.nave.setVelocityY(-200);
    } else if (cursors.down?.isDown) {
      this.nave.setVelocityY(200);
    }
  }
}


