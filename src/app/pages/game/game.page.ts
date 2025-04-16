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
// ...importaciones y @Component igual que antes

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

  mover(direccion: string) {
    const escena = this.game.scene.getScene('MainScene') as any;
    escena.moverDesdeBoton?.(direccion);
  }

  parar() {
    const escena = this.game.scene.getScene('MainScene') as any;
    escena.pararDesdeBoton?.();
  }

  dispararDesdeBoton() {
    const escena = this.game.scene.getScene('MainScene') as any;
    escena.disparar?.();
  }
}

// 👉 ESCENA DEL JUEGO
class MainScene extends Phaser.Scene {
  disparos!: Phaser.Physics.Arcade.Group;
  ultimaTeclaEspacio: number = 0;

  nave!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  direccionBoton: string | null = null;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    this.load.image('fondo', 'assets/img/fondo.png');
    this.load.image('nave', 'assets/img/nave.png');
    this.load.image('disparo', 'assets/img/disparo.png');
  }

  create(): void {
    this.add.image(0, 0, 'fondo').setOrigin(0);
    this.nave = this.physics.add.sprite(160, 450, 'nave');
    this.nave.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard?.createCursorKeys()!;
    this.disparos = this.physics.add.group();
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

    const ahora = this.time.now;
    if (this.cursors.space?.isDown && ahora - this.ultimaTeclaEspacio > 300) {
      this.disparar();
      this.ultimaTeclaEspacio = ahora;
    }
  }

  moverDesdeBoton(direccion: string) {
    this.direccionBoton = direccion;
  }

  pararDesdeBoton() {
    this.direccionBoton = null;
  }

  disparar() {
    const disparo = this.disparos.create(this.nave.x, this.nave.y - 20, 'disparo');
    disparo.setVelocityY(-300);
    disparo.setScale(0.3);         // 🔽 Tamaño reducido del disparo
    disparo.setAngle(-90);         // 🔄 Gira si es horizontal
  }
  
}
