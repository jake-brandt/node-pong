const BaseProp = require('./base-prop')
const Primitives = require('../primitives')

class Field extends BaseProp {
  get playableWidth () { return this.width - 2 }
  get playableHeight () { return this.height - 2 }

  constructor (width, height) {
    super(new Primitives.Vector2D(0, 0), width, height)

    this.blessedBox.style = {
      fg: 'white',
      bg: 'black',
      border: {
        type: 'line',
        fg: 'white',
        bg: 'black'
      }
    }
  }
}

module.exports = Field
