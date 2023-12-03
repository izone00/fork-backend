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
  speed: number;
  color: 'green';
  dx: number;
  dy: number;
};

const canvasWidth = 100;
const canvasHeight = 200;
const paddleWidth = 30;
const paddleHeight = 10;

export class Game {
  ball: Ball;
  player1: Player;
  player2: Player;

  constructor(socketId1: string, socketId2: string) {
    this.player1 = new Player(
      {
        x: canvasWidth / 2 - paddleWidth / 2,
        y: canvasHeight - paddleHeight,
        width: paddleWidth,
        height: paddleHeight,
        color: 'red',
        dx: 0,
      },
      socketId1,
      +1,
    );
    this.player2 = new Player(
      {
        x: canvasWidth / 2 - paddleWidth / 2,
        y: 0,
        width: paddleWidth,
        height: paddleHeight,
        color: 'blue',
        dx: 0,
      },
      socketId2,
      -1,
    );
    this.ball = {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      radius: 8,
      speed: 2,
      color: 'green',
      dx: 2,
      dy: 2,
    };
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
      const angle = (Math.random() * 0.8 + 0.1) * Math.PI;
      ball.speed += 1;
      ball.dx = Math.cos(angle) * ball.speed;
      ball.dy = -Math.sin(angle) * ball.speed;
    }
    // 상단바와의 충돌 체크
    if (
      ball.y - ball.radius < paddle2.y + paddle2.height &&
      ball.x > paddle2.x &&
      ball.x < paddle2.x + paddle2.width
    ) {
      const angle = (Math.random() * 0.8 + 0.1) * Math.PI;
      ball.speed += 1;
      ball.dx = Math.cos(angle) * ball.speed;
      ball.dy = Math.sin(angle) * ball.speed;
    }
    // 득점체크
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvasHeight) {
      ball.x = canvasWidth / 2;
      ball.y = canvasHeight / 2;
      ball.dy = -ball.dy;

      ball.speed = 2;
      ball.dx = 2;
      ball.dy = 2;
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

export class Player {
  paddleSpeed = 4;
  constructor(
    public paddle: Paddle,
    public socketId: string,
    private leftSign: number,
  ) {}

  moveRight() {
    this.paddle.dx = this.paddleSpeed * this.leftSign;
  }
  moveLeft() {
    this.paddle.dx = -this.paddleSpeed * this.leftSign;
  }
  moveStop() {
    this.paddle.dx = 0;
  }
}
