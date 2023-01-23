const BaseProp = require('./base-prop')
const Primitives = require('../primitives')
const Constants = require('../constants')

class Paddle extends BaseProp {
  /**
  * @param {Field} field
  * @param {*} fieldSide
  * @returns
  */
  constructor (field, fieldSide) {
    super(new Primitives.Vector2D(10, 0), 2, 10)

    this.move(
      new Primitives.Vector2D(
        fieldSide === Constants.LOCATION_RIGHT ? field.playableWidth - this._size.x : 0,
        30))

    this.blessedBox.style = {
      fg: 'white',
      bg: 'white'
    }

    this.fieldSide = fieldSide
  }
}

module.exports = Paddle
