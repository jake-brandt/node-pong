const BaseProp = require('./base-prop')
const Primitives = require('../primitives')
const blessed = require('../../../node_modules/blessed')

class Field extends BaseProp {
  get playableWidth () { return this._size.x - 2 }
  get playableHeight () { return this._size.y - 2 }

  constructor (width, height) {
    super(
      new Primitives.Vector2D(0, 0),
      width,
      height,
      {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'white',
          bg: 'black'
        }
      },
      {
        type: 'line'
      })
  }
}

module.exports = Field
