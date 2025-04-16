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

  pausarJuego() {
    const escena = this.game.scene.getScene('MainScene') as any;
    escena.pausarJuego?.();
  }

  reanudarJuego() {
    const escena = this.game.scene.getScene('MainScene') as any;
    escena.reanudarJuego?.();
  }
}

// 👉 ESCENA DEL JUEGO
class MainScene extends Phaser.Scene {
  disparos!: Phaser.Physics.Arcade.Group;
  asteroides!: Phaser.Physics.Arcade.Group;
  ultimaTeclaEspacio: number = 0;

  nave!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  direccionBoton: string | null = null;
  teclaEspacio!: Phaser.Input.Keyboard.Key;

  puntuacion: number = 0;
  textoPuntuacion!: Phaser.GameObjects.Text;

  juegoTerminado: boolean = false;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    this.load.image('fondo', 'assets/img/fondo.png');
    this.load.image('nave', 'assets/img/nave.png');
    this.load.image('disparo', 'assets/img/disparo.png');
    this.load.image('asteroide', 'assets/img/asteroide.png');
    this.load.image('explosion', 'assets/img/explosion.png');
  }

  create(): void {
    this.add.image(0, 0, 'fondo').setOrigin(0);
    this.nave = this.physics.add.sprite(160, 450, 'nave');
    this.nave.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard?.createCursorKeys()!;
    this.teclaEspacio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.disparos = this.physics.add.group();
    this.asteroides = this.physics.add.group();

    this.textoPuntuacion = this.add.text(10, 10, 'Puntos: 0', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
    });
    this.textoPuntuacion.setDepth(1);

    this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => {
        if (!this.juegoTerminado) {
          const x = Phaser.Math.Between(20, 300);
          const asteroide = this.asteroides.create(x, -50, 'asteroide') as Phaser.Physics.Arcade.Sprite;
          asteroide.setVelocityY(100);
          asteroide.setScale(0.5);
          asteroide.setCollideWorldBounds(false);
        }
      },
    });

    this.physics.add.overlap(
      this.disparos,
      this.asteroides,
      (disparoObj, asteroideObj) => this.colisionDisparoAsteroide(
        disparoObj as Phaser.Physics.Arcade.Sprite,
        asteroideObj as Phaser.Physics.Arcade.Sprite
      ),
      undefined,
      this
    );
  }

  colisionDisparoAsteroide(disparo: Phaser.Physics.Arcade.Sprite, asteroide: Phaser.Physics.Arcade.Sprite) {
    const explosion = this.add.image(asteroide.x, asteroide.y, 'explosion');
    explosion.setScale(0.09);
    explosion.setOrigin(0.5);
    this.time.delayedCall(300, () => explosion.destroy());

    disparo.destroy();
    asteroide.destroy();

    this.puntuacion += 10;
    this.textoPuntuacion.setText('Puntos: ' + this.puntuacion);

    if (this.puntuacion >= 150) {
      this.terminarPartida();
    }
  }

  terminarPartida() {
    this.juegoTerminado = true;
    this.scene.pause();

    this.add.text(160, 240, '¡Victoria!', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      const nombre = localStorage.getItem('nombreJugador') || 'Piloto desconocido';
      const almacenadas = localStorage.getItem('scores');
      let scores = almacenadas ? JSON.parse(almacenadas) : [];
      const existente = scores.find((entry: any) => entry.name === nombre);

      if (!existente || this.puntuacion > (existente?.score ?? 0)) {
        scores = scores.filter((entry: any) => entry.name !== nombre);
        scores.push({ name: nombre, score: this.puntuacion });
      }

      localStorage.setItem('scores', JSON.stringify(scores));
      window.location.href = '/pages/scores';
    });
  }

  override update(): void {
    if (!this.cursors || this.scene.isPaused()) return;

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

    this.asteroides.children.iterate((obj): false => {
      const ast = obj as Phaser.Physics.Arcade.Sprite;
      if (ast.y > 500) {
        ast.destroy();
      }
      return false;
    });
  }

  moverDesdeBoton(direccion: string) {
    this.direccionBoton = direccion;
  }

  pararDesdeBoton() {
    this.direccionBoton = null;
  }

  disparar() {
    const disparo = this.disparos.create(this.nave.x, this.nave.y - 20, 'disparo') as Phaser.Physics.Arcade.Sprite;
    disparo.setVelocityY(-300);
    disparo.setScale(0.3);
    disparo.setAngle(-90);
  }

  pausarJuego() {
    this.scene.pause();
  }

  reanudarJuego() {
    if (!this.juegoTerminado) {
      this.scene.resume();
    }
  }
}
