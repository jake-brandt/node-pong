const blessed = require('../node_modules/blessed')
const Constants = require('./engine/constants')
const GameState = require('./engine/game-state')
const IotHubService = require('./engine/iot-hub-service')

const screen = blessed.screen({
  smartCSR: true,
  title: 'A Game Like Pong'
})

const iotHubService = new IotHubService()
iotHubService.connect()

const gameState = new GameState(screen, iotHubService)

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], () => { process.exit(0) })
screen.key(['up'], () => { gameState.requestPaddleAction(true, Constants.DIRECTION_UP) })
screen.key(['down'], () => { gameState.requestPaddleAction(true, Constants.DIRECTION_DOWN) })
screen.key(['enter'], () => { testMsg() })

// Let 'er rip!
gameState.start()

iotHubService.inboundMessages.subscribe(msg => {
  console.log(msg)
})

function testMsg () {
  try {
    iotHubService.sendMessage('{"text": "hello"}')
  } catch (ex) {
    console.error(ex)
  }
  setTimeout(testMsg, 5000)
}
