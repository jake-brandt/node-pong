const blessed = require('../node_modules/blessed')
const Constants = require('./engine/constants')
const GameState = require('./engine/game-state')

const screen = blessed.screen({
  smartCSR: true,
  title: 'A Game Like Pong'
})

const gameState = new GameState(screen)

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0))
screen.key(['up'], (cd, key) => { gameState.requestPaddleAction(true, Constants.DIRECTION_UP) })
screen.key(['down'], (cd, key) => { gameState.requestPaddleAction(true, Constants.DIRECTION_DOWN) })

// Let 'er rip!
gameState.start()
