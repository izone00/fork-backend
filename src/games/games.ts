const canvasWidth = 100;
const canvasHeight = 200;
const paddleWidth = 30;
const paddleHeight = 10;

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
    radius: 8,
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
    const paddle1 = this.player1.paddle;
    if (paddle1.x + paddle1.dx > 0 && paddle1.x + paddle1.dx < canvasWidth - paddle1.width) {
      paddle1.x += paddle1.dx;
    }
    const paddle2 = this.player2.paddle;
    if (paddle2.x + paddle2.dx > 0 && paddle2.x + paddle2.dx < canvasWidth - paddle2.width) {
      paddle2.x += paddle2.dx;
    }
  }

  moveBall() {
    const ball = this.ball;
    const paddle1 = this.player1.paddle;
    const paddle2 = this.player2.paddle;

    ball.x += ball.dx;
    ball.y += ball.dy;
    // 벽과의 충돌 체크 (좌우)
    if (ball.x + ball.radius > canvasWidth || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
    }
    // 하단바와의 충돌 체크
    if (
      ball.y + ball.radius > paddle1.y &&
      ball.x > paddle1.x &&
      ball.x < paddle1.x + paddle1.width
    ) {
      // const angle = (Math.random() * 0.8 + 0.1) * Math.PI;
      // ball.dx = Math.cos(angle) * 1.2;
      // ball.dy = -Math.sin(angle) * 1.2;
      ball.dy = -Math.abs(ball.dy);
    }
    // 상단바와의 충돌 체크
    if (
      ball.y - ball.radius < paddle2.y + paddle2.height &&
      ball.x > paddle2.x &&
      ball.x < paddle2.x + paddle2.width
    ) {
      // const angle = (Math.random() * 0.8 + 0.1) * Math.PI;
      // ball.dx = Math.cos(angle) * 1.2;
      // ball.dy = Math.sin(angle) * 1.2;
      ball.dy = Math.abs(ball.dy);
    }
    // 득점체크
    if (ball.y - ball.radius < 0) {
      this.player2.score += 1;
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
    playerReverse1.paddle = { ...this.player1.paddle };
    playerReverse1.paddle.x = canvasWidth - this.player1.paddle.width - this.player1.paddle.x;
    playerReverse1.paddle.y = canvasHeight - this.player1.paddle.height - this.player1.paddle.y;
    const playerReverse2 = { ...this.player2 };
    playerReverse2.paddle = { ...this.player2.paddle };
    playerReverse2.paddle.x = canvasWidth - this.player2.paddle.width - this.player2.paddle.x;
    playerReverse2.paddle.y = canvasHeight - this.player2.paddle.height - this.player2.paddle.y;
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
    public paddle: Paddle,
  ) {}

  moveRight() {
    this.role === 'P1'
      ? (this.paddle.dx = +this.paddleSpeed)
      : (this.paddle.dx = -this.paddleSpeed);
  }
  moveLeft() {
    this.role === 'P1'
      ? (this.paddle.dx = -this.paddleSpeed)
      : (this.paddle.dx = +this.paddleSpeed);
  }
  moveStop() {
    this.paddle.dx = 0;
  }
}

export { Player, GameStatus };
