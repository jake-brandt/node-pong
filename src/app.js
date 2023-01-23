const blessed = require('../node_modules/blessed')
const Scene = require('./engine/scene')
const Props = require('./engine/props')
const Constants = require('./engine/constants')

const screen = blessed.screen({
  smartCSR: true,
  title: 'A Game Like Pong'
})

screen.title = screen.width

const scene = new Scene(screen.width, screen.height)
const field = new Props.Field(scene.screenWidth, scene.screenHeight)
const paddlePlayer = new Props.Paddle(field, Constants.LOCATION_LEFT)
const paddleCpu = new Props.Paddle(field, Constants.LOCATION_RIGHT)

scene.addProp(field)
scene.addProp(paddlePlayer, field)
scene.addProp(paddleCpu, field)

scene.addToBlessedScreen(screen)

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0))

screen.key(['up'], (cd, key) => {
  paddlePlayer.top -= 1
  screen.render()
})

screen.key(['down'], (cd, key) => {
  paddlePlayer.top += 1
  screen.render()
})

screen.render()
