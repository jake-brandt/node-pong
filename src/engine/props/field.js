const BaseProp = require('./base-prop')
const Primitives = require('../primitives')
const blessed = require('../../../node_modules/blessed')

class Field extends BaseProp {
  get playableWidth () { return this._size.x - 2 }
  get playableHeight () { return this._size.y - 2 }

  constructor (width, height) {
    super(new Primitives.Vector2D(0, 0), width, height)

    this._blessedBox = blessed.box({
      left: this._position.x,
      top: this._position.y,
      width: this._size.x,
      height: this._size.y,
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        bg: 'black',
        border: {
          fg: 'white',
          bg: 'black'
        }
      }
    })
  }
}

module.exports = Field
