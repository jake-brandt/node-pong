/* eslint-disable */
const blessed = require('../../../node_modules/blessed')
const Primitives = require('../primitives')
/* eslint-enable */

class BaseProp {
  /** @type {blessed.Box} */
  _blessedBox = null

  /** @type {Primitives.Vector2D} */
  _position = null

  /** @type {Primitives.Vector2D} */
  _size = null

  /** @returns {blessed.Box} */
  get blessedBox () {
    return this._blessedBox
  }

  /**
   * @param {Primitives.Vector2D} position
   * @param {Number} width
   * @param {Number} height
   */
  constructor (position, width, height) {
    this._position = new Primitives.Vector2D(position.x, position.y)
    this._size = new Primitives.Vector2D(width, height)

    this._blessedBox = blessed.box({
      left: this._position.x,
      top: this._position.y,
      width: this._size.x,
      height: this._size.y,
      style: {
        fg: 'white',
        bg: 'blue'
      }
    })
  }

  /**
   * @param {Primitives.Vector2D} position
   */
  move (position) {
    this._position = new Primitives.Vector2D(position.x, position.y)
    this._blessedBox.left = Math.round(this._position.x)
    this._blessedBox.top = Math.round(this._position.y)
  }
}

module.exports = BaseProp
