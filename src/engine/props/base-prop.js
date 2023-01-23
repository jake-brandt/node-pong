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
  get blessedBox () { return this._blessedBox }

  /** @returns {Primitives.Vector2D} */
  get position () { return this._position }

  /** @returns {Primitives.Vector2D} */
  get size () { return this._size }

  /**
   * @param {Primitives.Vector2D} position
   * @param {Number} width
   * @param {Number} height
   * @param {*} blessedStyleProps
   * @param {*} blessedBorderProps
   */
  constructor (position, width, height, blessedStyleProps, blessedBorderProps) {
    this._position = new Primitives.Vector2D(position.x, position.y)
    this._size = new Primitives.Vector2D(width, height)

    this._blessedBox = blessed.box({
      left: this._position.x,
      top: this._position.y,
      width: this._size.x,
      height: this._size.y,
      border: blessedBorderProps ?? null,
      style: blessedStyleProps ?? {
        fg: 'white',
        bg: 'blue'
      }
    })
  }

  /**
   * @param {Primitives.Vector2D} newPosition
   */
  move (newPosition) {
    this._position = Primitives.Vector2D.fromVector2D(newPosition)
    this.blessedBox.left = Math.round(this.position.x)
    this.blessedBox.top = Math.round(this.position.y)
  }
}

module.exports = BaseProp
