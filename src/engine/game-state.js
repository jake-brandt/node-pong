/* eslint-disable */
const blessed = require('../../node_modules/blessed')
const Scene = require('./scene')
const Props = require('./props')
const Constants = require('./constants')
const { Vector2D } = require('./primitives')
const IotHubService = require('../services/iot-hub-service')
/* eslint-enable */

const TELEMETRY_UPDATE_MILLIS = 750

class GameState {
  #paused = true
  #lastIterationMillis = Date.now()

  /** @type {IotHubService} */
  #iotHubService = null

  /** @type {blessed.Screen} */
  #blessedScreen = null
  /** @type {Scene} */
  #scene = null

  /** @type {Props.Field} */
  #field = null
  /** @type {Props.Paddle} */
  #paddlePlayer = null
  /** @type {Props.Paddle} */
  #paddleCpu = null
  /** @type {Props.Ball} */
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

  #iotHubState = {
    // Most recent time (UTC millis past epoch)
    time1: null,
    // Previous time (UTC millis past epoch)
    time2: null,
    // Ball most recent X, Y
    bX1: null,
    bY1: null,
    // Ball previous X, Y
    bX2: null,
    bY2: null,
    // Player paddle most recent X
    pX1: null,
    // Player paddle previous X
    pX2: null,
    // CPU paddle most recent X
    cX1: null,
    // CPU paddle previous X
    cX2: null,
    // Constant, paddle size
    paddleSize: null,
    // Constant, ball size
    ballSizeX: null,
    ballSizeY: null
  }

  /**
   * @param {blessed.Screen} blessedScreen
   */
  constructor (blessedScreen, iotHubService) {
    this.#scene = new Scene(blessedScreen.width, blessedScreen.height)
    this.#field = new Props.Field(this.#scene.screenWidth, this.#scene.screenHeight)
    this.#paddlePlayer = new Props.Paddle(this.#field, Constants.LOCATION_RIGHT, 'green')
    this.#paddleCpu = new Props.Paddle(this.#field, Constants.LOCATION_LEFT, 'blue')
    this.#ball = new Props.Ball(this.#field)

    this.#scene.addProp(this.#field)
    this.#scene.addProp(this.#paddlePlayer, this.#field)
    this.#scene.addProp(this.#paddleCpu, this.#field)
    this.#scene.addProp(this.#ball, this.#field)

    this.#blessedScreen = blessedScreen

    this.#iotHubService = iotHubService
    this.#iotHubService.inboundMessages.subscribe(this.#onIoTHubMessage.bind(this))
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
    this.#paused = true
  }

  resume () {
    this.#paused = false
    this.#lastIterationMillis = Date.now()
    setTimeout(this.#gameLoop.bind(this), 1000 / 30)
  }

  /**
   * @param {*} paddleOwner Can be either Constants.PADDLE_PLAYER or Constants.PADDLE_CPU
   * @param {*} direction
   */
  requestPaddleAction (paddleOwner, direction) {
    const vY = (direction === Constants.DIRECTION_UP) ? -64 : 64

    if (paddleOwner === Constants.PADDLE_PLAYER) {
      this.#pendingActions.playerMove = vY
    } else {
      this.#pendingActions.cpuMove = vY
    }
  }

  /**
   * @param {string} message
   */
  #onIoTHubMessage (message) {
    const jsonMessage = JSON.parse(message)

    if (jsonMessage.action === '+1') {
      this.requestPaddleAction(Constants.PADDLE_CPU, Constants.DIRECTION_DOWN)
    } else if (jsonMessage.action === '-1') {
      this.requestPaddleAction(Constants.PADDLE_CPU, Constants.DIRECTION_UP)
    }
  }

  #gameLoop () {
    const thisIterationMillis = Date.now()
    const dtMillis = thisIterationMillis - this.#lastIterationMillis
    const dtSeconds = dtMillis / 1000

    // Determine time since last msg sent to IoT hub
    const dtMillisIoTHub = this.#iotHubState.time1
      ? thisIterationMillis - this.#iotHubState.time1
      : Number.MAX_SAFE_INTEGER

    // Update telemetry only after a certain period of time
    const updateTelemetry = dtMillisIoTHub && dtMillisIoTHub >= TELEMETRY_UPDATE_MILLIS

    if (updateTelemetry) {
      // Make sure we send sizes; and don't forget to transpose X/Y
      this.#iotHubState.ballSizeX = this.#ball.size.y / this.#field.playableHeight
      this.#iotHubState.ballSizeY = this.#ball.size.x / this.#field.playableWidth
      this.#iotHubState.paddleSize = this.#paddlePlayer.size.y / this.#field.playableHeight

      // Move previous state to "old" state
      this.#iotHubState.time2 = this.#iotHubState.time1
      this.#iotHubState.time1 = thisIterationMillis
      this.#iotHubState.bX2 = this.#iotHubState.bX1
      this.#iotHubState.bY2 = this.#iotHubState.bY1
      this.#iotHubState.pX2 = this.#iotHubState.pX1
      this.#iotHubState.cX2 = this.#iotHubState.cX1
    }

    this.#stepBallPhysics(dtSeconds, updateTelemetry)
    this.#stepPaddlePhysics(dtSeconds, Constants.PADDLE_PLAYER, updateTelemetry)
    this.#stepPaddlePhysics(dtSeconds, Constants.PADDLE_CPU, updateTelemetry)
    this.#blessedScreen.render()
    this.#lastIterationMillis = thisIterationMillis

    // If we have a previous state then we can send telemetry to IoT Hub,
    // if not, we'll send it next time through here.

    if (this.#iotHubState.time2 && updateTelemetry) {
      this.#iotHubService.sendMessage(JSON.stringify(this.#iotHubState))
    }

    // Call this function again as close to 30fps as possible, so account
    // for the time spent on above tasks.

    if (!this.#paused) {
      const iterationEndMillis = Date.now()
      setTimeout(this.#gameLoop.bind(this), (1000 / 30) - (iterationEndMillis - thisIterationMillis))
    }
  }

  /**
   * @param {Number} dtSeconds
   * @param {boolean} updateTelemetry
   */
  #stepBallPhysics (dtSeconds, updateTelemetry) {
    let ballDx = this.#velocities.ballX * dtSeconds
    let ballDy = this.#velocities.ballY * dtSeconds
    let ballLeft = this.#ball.position.x + ballDx
    let ballTop = this.#ball.position.y + ballDy
    const ballRight = ballLeft + this.#ball.size.x
    const ballBottom = ballTop + this.#ball.size.y

    if (ballLeft < 0 && this.#velocities.ballX < 0) {
      this.#velocities.ballX = 32
      ballDx = this.#velocities.ballX * dtSeconds
      ballLeft = 0
    } else if (ballRight >= this.#field.playableWidth - 1 && this.#velocities.ballX > 0) {
      this.#velocities.ballX = -32
      ballDx = this.#velocities.ballX * dtSeconds
      ballLeft = this.#field.playableWidth - this.#ball.size.x - 1
    }

    if (ballTop < 0 && this.#velocities.ballY < 0) {
      this.#velocities.ballY = -1 * this.#velocities.ballY
      ballDy = this.#velocities.ballY * dtSeconds
      ballTop = 0
    } else if (ballBottom >= this.#field.playableHeight - 1 && this.#velocities.ballY > 0) {
      this.#velocities.ballY = -1 * this.#velocities.ballY
      ballDy = this.#velocities.ballY * dtSeconds
      ballTop = this.#field.playableHeight - this.#ball.size.y - 1
    }

    if (updateTelemetry) {
      // Normalize for IoT Hub, transpose X and Y (IoT Hub will expect Y to be "downfield")
      // Store in IoT state
      this.#iotHubState.bX1 = (ballTop + (this.#ball.size.y / 2)) / this.#field.playableHeight
      this.#iotHubState.bY1 = (ballLeft + (this.#ball.size.x / 2)) / this.#field.playableWidth
    }

    this.#ball.move(new Vector2D(ballLeft, ballTop))
  }

  /**
   * @param {Number} dtSeconds
   * @param {*} paddleOwner Can be either Constants.PADDLE_PLAYER or Constants.PADDLE_CPU
   * @param {boolean} updateTelemetry
   */
  #stepPaddlePhysics (dtSeconds, paddleOwner, updateTelemetry) {
    /** @type {Props.Paddle} */
    const paddle = paddleOwner === Constants.PADDLE_PLAYER ? this.#paddlePlayer : this.#paddleCpu
    let paddleVelocityY = paddleOwner === Constants.PADDLE_PLAYER ? this.#velocities.playerY : this.#velocities.cpuY
    const pendingAction = paddleOwner === Constants.PADDLE_PLAYER ? this.#pendingActions.playerMove : this.#pendingActions.cpuMove

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
      if (paddleOwner === Constants.PADDLE_PLAYER) {
        this.#pendingActions.playerMove = 0
      } else {
        this.#pendingActions.cpuMove = 0
      }
    }

    let paddleDy = paddleVelocityY * dtSeconds
    let paddleTop = paddle.position.y + paddleDy
    const paddleBottom = paddleTop + paddle.size.y

    if (paddleTop < 0 && paddleVelocityY < 0) {
      paddleVelocityY = 0
      paddleDy = paddleVelocityY * dtSeconds
      paddleTop = 0
    } else if (paddleBottom > this.#field.playableHeight && paddleVelocityY > 0) {
      paddleVelocityY = 0
      paddleDy = paddleVelocityY * dtSeconds
      paddleTop = this.#field.playableHeight - paddle.size.y - 1
    }

    paddle.move(new Vector2D(paddle.position.x, paddleTop))

    // Normalize for IoT Hub, transpose X and Y (IoT Hub will expect Y to be "downfield")
    // Store in IoT state
    const normalizedX = (paddleTop + (paddle.size.y / 2)) / this.#field.playableHeight

    if (paddleOwner === Constants.PADDLE_PLAYER) {
      this.#velocities.playerY = paddleVelocityY
      if (updateTelemetry) {
        // Remember, X/Y are transposed in our hub implemntation
        this.#iotHubState.pX1 = normalizedX
      }
    } else {
      this.#velocities.cpuY = paddleVelocityY
      if (updateTelemetry) {
        // Remember, X/Y are transposed in our hub implemntation
        this.#iotHubState.cX1 = normalizedX
      }
    }
  }
}

module.exports = GameState
