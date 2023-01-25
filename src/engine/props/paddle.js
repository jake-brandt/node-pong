const BaseProp = require('./base-prop')
const Field = require('./field')
const Primitives = require('../primitives')
const Constants = require('../constants')

class Paddle extends BaseProp {
  /**
  * @param {Field} field
  * @param {*} fieldSide
  * @param {string} paddleColor
  * @returns
  */
  constructor (field, fieldSide, paddleColor) {
    super(
      new Primitives.Vector2D(0, 0),
      2,
      field.playableHeight * 0.13, // Paddle height is 13% of field height
      {
        fg: 'white',
        bg: paddleColor
      })

    this.move(
      new Primitives.Vector2D(
        fieldSide === Constants.LOCATION_RIGHT ? field.playableWidth - this.size.x : 0,
        (field.playableHeight / 2) - (this.size.y / 2)))

    this.fieldSide = fieldSide
  }
}

module.exports = Paddle
