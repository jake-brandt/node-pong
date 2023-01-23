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
  #ballVel = 32

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
    this.#scene.addToBlessedScreen(this.#blessedScreen)
    this.resume()
  }

  pause () {
    clearInterval(this.#gameInterval)
  }

  resume () {
    this.#gameInterval = setInterval(this.#gameLoop.bind(this), 1000 / 30)
  }

  /**
   * @param {boolean} isPlayer
   * @param {*} direction
   */
  requestPaddleAction (isPlayer, direction) {
    const paddle = isPlayer ? this.#paddlePlayer : this.#paddleCpu
    const position = Vector2D.fromVector2D(paddle.position)
    position.y += (direction === Constants.DIRECTION_UP) ? -2 : 2
    paddle.move(position)
  }

  #gameLoop () {
    const thisIterationMillis = Date.now()
    const dtMillis = thisIterationMillis - this.#lastIterationMillis
    const dtSeconds = dtMillis / 1000

    let ballDx = this.#ballVel * dtSeconds
    let ballLeft = this.#ball.position.x + ballDx
    const ballRight = ballLeft + (this.#ball.size.x - 1)

    if (ballLeft < 0 && this.#ballVel < 0) {
      this.#ballVel = 32
      ballDx = this.#ballVel * dtSeconds
      ballLeft = 0
    } else if (ballRight > this.#field.playableWidth && this.#ballVel > 0) {
      this.#ballVel = -32
      ballDx = this.#ballVel * dtSeconds
      ballLeft = this.#field.playableWidth - this.#ball.size.x
    }

    this.#ball.move(new Vector2D(
      ballLeft,
      this.#ball.position.y))

    this.#blessedScreen.render()

    this.#lastIterationMillis = thisIterationMillis
  }
}

module.exports = GameState
