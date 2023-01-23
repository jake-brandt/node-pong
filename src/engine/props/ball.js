/* eslint-disable */
const BaseProp = require('./base-prop')
const Field = require('./field')
const Primitives = require('../primitives')
const Constants = require('../constants')
/* eslint-enable */

class Paddle extends BaseProp {
  /**
  * @param {Field} field
  * @param {*} fieldSide
  * @returns
  */
  constructor (field) {
    super(
      new Primitives.Vector2D(0, 0),
      3,
      3,
      {
        fg: 'red',
        bg: 'red'
      })

    this.move(new Primitives.Vector2D(
      (field._size.x / 2) - (this._size.x / 2),
      (field._size.y / 2) - (this._size.y / 2)))
  }
}

module.exports = Paddle
