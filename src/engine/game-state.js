/* eslint-disable */
const blessed = require('../../node_modules/blessed')
const Scene = require('./scene')
const Props = require('./props')
const Constants = require('./constants')
const { Vector2D } = require('./primitives')
/* eslint-enable */

class GameState {
  #gameInterval = null
  #lastIterationMillis = Date.now()
  #blessedScreen = null
  #scene = null
  #field = null
  #paddlePlayer = null
  #paddleCpu = null
  #ball = null

  #pendingActions = {
    playerMove: 0,
    cpuMove: 0
  }

  #velocities = {
    playerY: 0,
    cpuY: 0,
    ballX: 0,
    ballY: 0
  }

  /**
   * @param {blessed.Screen} blessedScreen
   */
  constructor (blessedScreen) {
    this.#scene = new Scene(blessedScreen.width, blessedScreen.height)
    this.#field = new Props.Field(this.#scene.screenWidth, this.#scene.screenHeight)
    this.#paddlePlayer = new Props.Paddle(this.#field, Constants.LOCATION_LEFT)
    this.#paddleCpu = new Props.Paddle(this.#field, Constants.LOCATION_RIGHT)
    this.#ball = new Props.Ball(this.#field)

    this.#scene.addProp(this.#field)
    this.#scene.addProp(this.#paddlePlayer, this.#field)
    this.#scene.addProp(this.#paddleCpu, this.#field)
    this.#scene.addProp(this.#ball, this.#field)

    this.#blessedScreen = blessedScreen
  }

  start () {
    this.#velocities = {
      playerY: 0,
      cpuY: 0,
      ballX: (Math.random() >= 0.5) ? 32 : -32,
      ballY: 10
    }

    this.#scene.addToBlessedScreen(this.#blessedScreen)
    this.resume()
  }

  pause () {
    clearInterval(this.#gameInterval)
  }

  resume () {
    this.#lastIterationMillis = Date.now()
    this.#gameInterval = setInterval(this.#gameLoop.bind(this), 1000 / 30)
  }

  /**
   * @param {boolean} isPlayer
   * @param {*} direction
   */
  requestPaddleAction (isPlayer, direction) {
    const vY = (direction === Constants.DIRECTION_UP) ? -64 : 64

    if (isPlayer) {
      this.#pendingActions.playerMove = vY
    } else {
      this.#pendingActions.cpuMove = vY
    }
  }

  #gameLoop () {
    const thisIterationMillis = Date.now()
    const dtMillis = thisIterationMillis - this.#lastIterationMillis
    const dtSeconds = dtMillis / 1000

    this.#stepBallPhysics(dtSeconds)
    this.#stepPaddlePhysics(dtSeconds, true)
    this.#stepPaddlePhysics(dtSeconds, false)
    this.#blessedScreen.render()
    this.#lastIterationMillis = thisIterationMillis
  }

  /**
   * @param {Number} dtSeconds
   */
  #stepBallPhysics (dtSeconds) {
    let ballDx = this.#velocities.ballX * dtSeconds
    let ballDy = this.#velocities.ballY * dtSeconds
    let ballLeft = this.#ball.position.x + ballDx
    let ballTop = this.#ball.position.y + ballDy
    const ballRight = ballLeft + (this.#ball.size.x - 1)
    const ballBottom = ballTop + (this.#ball.size.y - 1)

    if (ballLeft < 0 && this.#velocities.ballX < 0) {
      this.#velocities.ballX = 32
      ballDx = this.#velocities.ballX * dtSeconds
      ballLeft = 0
    } else if (ballRight > this.#field.playableWidth && this.#velocities.ballX > 0) {
      this.#velocities.ballX = -32
      ballDx = this.#velocities.ballX * dtSeconds
      ballLeft = this.#field.playableWidth - this.#ball.size.x
    }

    if (ballTop < 0 && this.#velocities.ballY < 0) {
      this.#velocities.ballY = -1 * this.#velocities.ballY
      ballDy = this.#velocities.ballY * dtSeconds
      ballTop = 0
    } else if (ballBottom > this.#field.playableHeight && this.#velocities.ballY > 0) {
      this.#velocities.ballY = -1 * this.#velocities.ballY
      ballDy = this.#velocities.ballY * dtSeconds
      ballTop = this.#field.playableHeight - this.#ball.size.y
    }

    this.#ball.move(new Vector2D(ballLeft, ballTop))
  }

  /**
   * @param {Number} dtSeconds
   * @param {boolean} isPlayer
   */
  #stepPaddlePhysics (dtSeconds, isPlayer) {
    /** @type {Props.Paddle} */
    const paddle = isPlayer ? this.#paddlePlayer : this.#paddleCpu
    let paddleVelocityY = isPlayer ? this.#velocities.playerY : this.#velocities.cpuY
    const pendingAction = isPlayer ? this.#pendingActions.playerMove : this.#pendingActions.cpuMove

    if (pendingAction === 0) {
      // Simulate friction
      if (paddleVelocityY > 0) {
        paddleVelocityY -= 256 * dtSeconds
        if (paddleVelocityY < 0) {
          paddleVelocityY = 0
        }
      } else if (paddleVelocityY < 0) {
        paddleVelocityY += 256 * dtSeconds
        if (paddleVelocityY > 0) {
          paddleVelocityY = 0
        }
      }
    } else {
      paddleVelocityY = pendingAction
      if (isPlayer) {
        this.#pendingActions.playerMove = 0
      } else {
        this.#pendingActions.cpuMove = 0
      }
    }

    let paddleDy = paddleVelocityY * dtSeconds
    let paddleTop = paddle.position.y + paddleDy
    const paddleBottom = paddleTop + (paddle.size.y - 1)

    if (paddleTop < 0 && paddleVelocityY < 0) {
      paddleVelocityY = 0
      paddleDy = paddleVelocityY * dtSeconds
      paddleTop = 0
    } else if (paddleBottom > this.#field.playableHeight && paddleVelocityY > 0) {
      paddleVelocityY = 0
      paddleDy = paddleVelocityY * dtSeconds
      paddleTop = this.#field.playableHeight - paddle.size.y
    }

    paddle.move(new Vector2D(paddle.position.x, paddleTop))

    if (isPlayer) {
      this.#velocities.playerY = paddleVelocityY
    } else {
      this.#velocities.cpuY = paddleVelocityY
    }
  }
}

module.exports = GameState
