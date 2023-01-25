const blessed = require('../node_modules/blessed')
const Constants = require('./engine/constants')
const GameState = require('./engine/game-state')
const IotHubService = require('./services/iot-hub-service')
const DiagnosticsTerminal = require('./components/diagnostics-terminal')

const screen = blessed.screen({
  smartCSR: true,
  title: 'A Game Like Pong'
})

const iotHubService = new IotHubService()
const gameState = new GameState(screen, iotHubService)
const diagnosticsTerminal = new DiagnosticsTerminal(screen, iotHubService)

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], () => { process.exit(0) })
screen.key(['up'], () => { gameState.requestPaddleAction(Constants.PADDLE_PLAYER, Constants.DIRECTION_UP) })
screen.key(['down'], () => { gameState.requestPaddleAction(Constants.PADDLE_PLAYER, Constants.DIRECTION_DOWN) })

// Let 'er rip!
iotHubService.connect()
gameState.start()
diagnosticsTerminal.start()
