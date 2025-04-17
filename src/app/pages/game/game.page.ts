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
  juegoPausado: boolean = false;

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
    (window as any).gamePageRef = this;
    this.juegoPausado = false;
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
    escena.sonidoDisparo?.play();
    escena.disparar?.();
  }

  pausarJuego() {
    this.game.scene.pause('MainScene');
    this.juegoPausado = true;
  }

  reanudarJuego() {
    this.game.scene.resume('MainScene');
    this.juegoPausado = false;
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

  jefe!: Phaser.Physics.Arcade.Sprite | null;
  jefeVida: number = 10;
  jefeActivo: boolean = false;
  jefeDerrotado: boolean = false;

  musicaFondo!: Phaser.Sound.BaseSound;
  sonidoDisparo!: Phaser.Sound.BaseSound;
  sonidoExplosion!: Phaser.Sound.BaseSound;
  musicaGanador!: Phaser.Sound.BaseSound;
  musicaDerrota!: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    this.load.audio('musica_fondo', 'assets/audio/musica_fondo.mp3');
    this.load.audio('disparo', 'assets/audio/disparo.mp3');
    this.load.audio('explosion', 'assets/audio/explosion.mp3');
    this.load.audio('ganador', 'assets/audio/ganador.mp3');
    this.load.audio('derrota', 'assets/audio/derrota.mp3');

    this.load.image('fondo', 'assets/img/fondo.png');
    this.load.image('nave', 'assets/img/nave.png');
    this.load.image('disparo', 'assets/img/disparo.png');
    this.load.image('explosion', 'assets/img/explosion.png');

    this.load.image('asteroide_grande', 'assets/img/asteroide_grande.png');
    this.load.image('asteroide_mediano', 'assets/img/asteroide_mediano.png');
    this.load.image('asteroide', 'assets/img/asteroide.png');
    this.load.image('jefe', 'assets/img/jefe.png');
  }

  create(): void {
    this.add.image(0, 0, 'fondo').setOrigin(0);
    this.nave = this.physics.add.sprite(160, 450, 'nave');
    this.nave.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard?.createCursorKeys()!;
    this.teclaEspacio = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.disparos = this.physics.add.group();
    this.asteroides = this.physics.add.group();

    this.musicaFondo = this.sound.add('musica_fondo', { loop: true, volume: 0.3 });
    this.sonidoDisparo = this.sound.add('disparo');
    this.sonidoExplosion = this.sound.add('explosion');
    this.musicaGanador = this.sound.add('ganador');
    this.musicaDerrota = this.sound.add('derrota');
    this.musicaFondo.play();

    this.textoPuntuacion = this.add.text(10, 10, 'Puntos: 0', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setDepth(1);

    this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => {
        if (!this.juegoTerminado) {
          const tipo = Phaser.Math.Between(1, 3);
          let sprite = '';
          let velocidad = 100;
          let escala = 0.3;
          let puntos = 1;

          if (tipo === 1) {
            sprite = 'asteroide_grande';
            velocidad = 80;
            escala = 0.09;
            puntos = 1;
          } else if (tipo === 2) {
            sprite = 'asteroide_mediano';
            velocidad = 120;
            escala = 0.07;
            puntos = 2;
          } else {
            sprite = 'asteroide';
            velocidad = 160;
            escala = 0.07;
            puntos = 3;
          }

          const x = Phaser.Math.Between(20, 300);
          const asteroide = this.asteroides.create(x, -50, sprite) as Phaser.Physics.Arcade.Sprite;
          asteroide.setVelocityY(velocidad);
          asteroide.setScale(escala);
          asteroide.setSize(asteroide.width * 0.5, asteroide.height * 0.5);
          asteroide.setOffset(asteroide.width * 0.25, asteroide.height * 0.25);
          (asteroide as any).puntos = puntos;
        }
      },
    });

    this.physics.add.overlap(this.disparos, this.asteroides, this.colisionDisparoAsteroide, undefined, this);
    this.physics.add.overlap(this.nave, this.asteroides, this.colisionNaveAsteroide, undefined, this);
  }

  disparar() {
  const disparo = this.disparos.create(this.nave.x + 1.6, this.nave.y - 20, 'disparo') as Phaser.Physics.Arcade.Sprite;
  disparo.setVelocityY(-300);
  disparo.setScale(0.15);
  disparo.setAngle(-90);
  disparo.setOrigin(0.5, 1);
  disparo.setSize(disparo.width * 0.5, disparo.height * 0.5);
  disparo.setOffset(disparo.width * 0.25, 0);
}

  
  
  

  colisionDisparoAsteroide(disparo: Phaser.Physics.Arcade.Sprite, asteroide: Phaser.Physics.Arcade.Sprite) {
    const explosion = this.add.image(asteroide.x, asteroide.y, 'explosion');
    explosion.setScale(0.09).setOrigin(0.5);
    this.time.delayedCall(300, () => explosion.destroy());
    this.sonidoExplosion.play();

    const puntosGanados = (asteroide as any).puntos || 1;
    this.puntuacion += puntosGanados;
    this.textoPuntuacion.setText('Puntos: ' + this.puntuacion);

    disparo.destroy();
    asteroide.destroy();

    if (this.puntuacion >= 50 && !this.jefeActivo && !this.jefeDerrotado) {
      this.invocarJefe();
    }

    if (this.puntuacion >= 150) {
      this.terminarPartida();
    }
  }

  invocarJefe() {
    this.jefeActivo = true;
    this.jefeVida = 10;

    this.jefe = this.physics.add.sprite(160, -60, 'jefe').setScale(0.4);
    this.jefe.setVelocityY(60);
    this.physics.add.overlap(this.disparos, this.jefe, this.colisionDisparoJefe, undefined, this);
    this.physics.add.overlap(this.nave, this.jefe, this.colisionNaveAsteroide, undefined, this);
  }

  colisionDisparoJefe(disparo: Phaser.Physics.Arcade.Sprite, jefe: Phaser.Physics.Arcade.Sprite) {
    disparo.destroy();
    this.jefeVida--;

    const explosion = this.add.image(jefe.x, jefe.y, 'explosion').setScale(0.1).setOrigin(0.5);
    this.time.delayedCall(300, () => explosion.destroy());
    this.sonidoExplosion.play();

    if (this.jefeVida <= 0) {
      jefe.destroy();
      this.puntuacion += 10;
      this.textoPuntuacion.setText('Puntos: ' + this.puntuacion);
      this.jefeActivo = false;
      this.jefeDerrotado = true;
    }
  }

  colisionNaveAsteroide() {
    if (this.juegoTerminado) return;
    this.juegoTerminado = true;

    this.add.text(160, 240, '💥 Has perdido', {
      fontSize: '24px',
      color: '#ff0000',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.musicaFondo.stop();
    this.musicaDerrota.play();

    this.time.delayedCall(500, () => {
      this.scene.pause();
      setTimeout(() => {
        const reiniciar = confirm('💥 Has perdido. ¿Quieres reiniciar la partida?');
        if (reiniciar) {
          const gamePage = (window as any).gamePageRef;
          gamePage?.restartGame?.();
        }
      }, 100);
    });
  }

  terminarPartida() {
    this.juegoTerminado = true;
    this.scene.pause();

    this.add.text(160, 240, '¡Victoria!', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.musicaFondo.stop();
    this.musicaGanador.play();

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
      this.sonidoDisparo.play();
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

  pausarJuego() {
    this.scene.pause();
  }

  reanudarJuego() {
    if (!this.juegoTerminado) {
      this.scene.resume();
    }
  }
}

