const canvasWidth = 500;
const canvasHeight = 1000;
const paddleWidth = 150;
const paddleHeight = 50;

type Paddle = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: 'blue' | 'red';
  dx: number;
};
type Ball = {
  x: number;
  y: number;
  radius: number;
  color: 'green';
  dx: number;
  dy: number;
};

enum GameStatus {
  READY = 'ready',
  PROGRESS = 'progress',
  PAUSE = 'pause',
  FINISH = 'finish',
}

export class Game {
  player1 = new Player('P1', {
    x: canvasWidth / 2 - paddleWidth / 2,
    y: canvasHeight - paddleHeight,
    width: paddleWidth,
    height: paddleHeight,
    color: 'red',
    dx: 0,
  });
  player2 = new Player('P2', {
    x: canvasWidth / 2 - paddleWidth / 2,
    y: 0,
    width: paddleWidth,
    height: paddleHeight,
    color: 'blue',
    dx: 0,
  });
  ball: Ball = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    radius: 20,
    color: 'green',
    dx: 4,
    dy: 4,
  };
  status: GameStatus = GameStatus.READY;

  constructor(socketId1: string, socketId2: string) {
    this.player1.socketId = socketId1;
    this.player2.socketId = socketId2;
  }
  movePaddle() {
    const bar1 = this.player1.bar;
    if (bar1.x + bar1.dx > 0 && bar1.x + bar1.dx < canvasWidth - bar1.width) {
      bar1.x += bar1.dx;
    }
    const bar2 = this.player2.bar;
    if (bar2.x + bar2.dx > 0 && bar2.x + bar2.dx < canvasWidth - bar2.width) {
      bar2.x += bar2.dx;
    }
  }

  moveBall() {
    const ball = this.ball;
    const bar1 = this.player1.bar;
    const bar2 = this.player2.bar;

    ball.x += ball.dx;
    ball.y += ball.dy;
    // 벽과의 충돌 체크 (좌우)
    if (ball.x + ball.radius > canvasWidth || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
    }
    // 하단바와의 충돌 체크
    if (ball.y + ball.radius > bar1.y && ball.x > bar1.x && ball.x < bar1.x + bar1.width) {
      // const angle = (Math.random() * 0.8 + 0.1) * Math.PI;
      // ball.dx = Math.cos(angle) * 1.2;
      // ball.dy = -Math.sin(angle) * 1.2;
      ball.dy = -Math.abs(ball.dy);
    }
    // 상단바와의 충돌 체크
    if (
      ball.y - ball.radius < bar2.y + bar2.height &&
      ball.x > bar2.x &&
      ball.x < bar2.x + bar2.width
    ) {
      // const angle = (Math.random() * 0.8 + 0.1) * Math.PI;
      // ball.dx = Math.cos(angle) * 1.2;
      // ball.dy = Math.sin(angle) * 1.2;
      ball.dy = Math.abs(ball.dy);
    }
    // 득점체크
    if (ball.y - ball.radius < 0) {
      this.player1.score += 1;
      ball.x = canvasWidth / 2;
      ball.y = canvasHeight / 2;
      ball.dy = -ball.dy;

      ball.dx = 4;
      ball.dy = 4;
    } else if (ball.y + ball.radius > canvasHeight) {
      this.player2.score += 1;
      ball.x = canvasWidth / 2;
      ball.y = canvasHeight / 2;
      ball.dy = -ball.dy;

      ball.dx = 4;
      ball.dy = 4;
    }

    if (this.player1.score === 3 || this.player2.score === 3) {
      this.status = GameStatus.FINISH;
    }
  }

  reverse() {
    const playerReverse1 = { ...this.player1 };
    playerReverse1.bar = { ...this.player1.bar };
    playerReverse1.bar.x = canvasWidth - this.player1.bar.width - this.player1.bar.x;
    playerReverse1.bar.y = canvasHeight - this.player1.bar.height - this.player1.bar.y;
    const playerReverse2 = { ...this.player2 };
    playerReverse2.bar = { ...this.player2.bar };
    playerReverse2.bar.x = canvasWidth - this.player2.bar.width - this.player2.bar.x;
    playerReverse2.bar.y = canvasHeight - this.player2.bar.height - this.player2.bar.y;
    const ballReverse = { ...this.ball };
    ballReverse.x = canvasWidth - this.ball.x;
    ballReverse.y = canvasHeight - this.ball.y;

    return { playerReverse1, playerReverse2, ballReverse };
  }
}

class Player {
  paddleSpeed = 4;
  socketId: string;
  userId: number;
  score = 0;
  constructor(
    private role: 'P1' | 'P2',
    public bar: Paddle,
  ) {}

  moveRight() {
    this.role === 'P1' ? (this.bar.dx = +this.paddleSpeed) : (this.bar.dx = -this.paddleSpeed);
  }
  moveLeft() {
    this.role === 'P1' ? (this.bar.dx = -this.paddleSpeed) : (this.bar.dx = +this.paddleSpeed);
  }
  moveStop() {
    this.bar.dx = 0;
  }
}

export { Player, GameStatus };
