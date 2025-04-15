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

    // 🧪 Simulación de fin de partida tras 5 segundos
    setTimeout(() => {
      const nombre = localStorage.getItem('nombreJugador') || 'Piloto desconocido';
      const nuevaPuntuacion = Math.floor(Math.random() * 100);

      const almacenadas = localStorage.getItem('scores');
      let scores = almacenadas ? JSON.parse(almacenadas) : [];

      const existente = scores.find((entry: any) => entry.name === nombre);

      if (!existente || nuevaPuntuacion > existente.score) {
        scores = scores.filter((entry: any) => entry.name !== nombre);
        scores.push({ name: nombre, score: nuevaPuntuacion });
        console.log(`✅ Puntuación actualizada para ${nombre}: ${nuevaPuntuacion}`);
      }

      localStorage.setItem('scores', JSON.stringify(scores));
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

  // 👉 Métodos para botones visuales (touch)
  mover(direccion: string) {
    const escena = this.game.scene.getScene('MainScene') as any;
    escena.moverDesdeBoton?.(direccion);
  }

  parar() {
    const escena = this.game.scene.getScene('MainScene') as any;
    escena.pararDesdeBoton?.();
  }
}

// 👉 ESCENA DEL JUEGO
class MainScene extends Phaser.Scene {
  nave!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  direccionBoton: string | null = null;

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
    this.cursors = this.input.keyboard?.createCursorKeys()!;
  }

  override update(): void {
    if (!this.cursors) return;

    this.nave.setVelocity(0);

    if (this.cursors.left?.isDown || this.direccionBoton === 'izquierda') {
      this.nave.setVelocityX(-200);
    } else if (this.cursors.right?.isDown || this.direccionBoton === 'derecha') {
      this.nave.setVelocityX(200);
    }

    if (this.cursors.up?.isDown || this.direccionBoton === 'arriba') {
      this.nave.setVelocityY(-200);
    } else if (this.cursors.down?.isDown || this.direccionBoton === 'abajo') {
      this.nave.setVelocityY(200);
    }
  }

  // Métodos accesibles desde el componente
  moverDesdeBoton(direccion: string) {
    this.direccionBoton = direccion;
  }

  pararDesdeBoton() {
    this.direccionBoton = null;
  }
}




