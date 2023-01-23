const blessed = require('../node_modules/blessed')
const Scene = require('./engine/scene')
const Props = require('./engine/props')
const Constants = require('./engine/constants')
const { Vector2D } = require('./engine/primitives')

const screen = blessed.screen({
  smartCSR: true,
  title: 'A Game Like Pong'
})

screen.title = screen.width

const scene = new Scene(screen.width, screen.height)
const field = new Props.Field(scene.screenWidth, scene.screenHeight)
const paddlePlayer = new Props.Paddle(field, Constants.LOCATION_LEFT)
const paddleCpu = new Props.Paddle(field, Constants.LOCATION_RIGHT)
const ball = new Props.Ball(field)

scene.addProp(field)
scene.addProp(paddlePlayer, field)
scene.addProp(paddleCpu, field)
scene.addProp(ball, field)

scene.addToBlessedScreen(screen)

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0))

screen.key(['up'], (cd, key) => {
  const position = Vector2D.fromVector2D(paddlePlayer.position)
  position.y -= 2
  paddlePlayer.move(position)
})

screen.key(['down'], (cd, key) => {
  const position = Vector2D.fromVector2D(paddlePlayer.position)
  position.y += 2
  paddlePlayer.move(position)
})

// This isn't complete yet; but proves we can bounce the ball back and
// forth in a game loop, and that our game models (or "props") are staying
// in-sync with the Blessed system's object states.

let ballVel = 32
let lastIterationMillis = Date.now()
const gameLoop = () => {
  const thisIterationMillis = Date.now()
  const dtMillis = thisIterationMillis - lastIterationMillis
  const dtSeconds = dtMillis / 1000

  let ballDx = ballVel * dtSeconds
  let ballLeft = ball.position.x + ballDx
  const ballRight = ballLeft + (ball.size.x - 1)

  if (ballLeft < 0 && ballVel < 0) {
    ballVel = 32
    ballDx = ballVel * dtSeconds
    ballLeft = 0
  } else if (ballRight > field.playableWidth && ballVel > 0) {
    ballVel = -32
    ballDx = ballVel * dtSeconds
    ballLeft = field.playableWidth - ball.size.x
  }

  ball.move(new Vector2D(
    ballLeft,
    ball.position.y))

  screen.render()

  lastIterationMillis = thisIterationMillis
}

// Kick off the game loop! 30fps, no idea if that is realistic or not
setInterval(gameLoop, 1000 / 30)
