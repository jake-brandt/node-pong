const blessed = require('../../../node_modules/blessed')

class BaseProp {
  /**
   * @type {blessed.Box}
   */
  #blessedBox = null

  /**
   * @returns {blessed.Box}
   */
  get blessedBox () {
    return this.#blessedBox
  }

  /**
   * @param {primitives.Vector2D} position
   * @param {Number} width
   * @param {Number} height
   */
  constructor (position, width, height) {
    this.x = position.x
    this.y = position.y
    this.width = width
    this.height = height

    this.#blessedBox = blessed.box({
      left: this.x,
      top: this.y,
      width: this.width,
      height: this.height,
      style: {
        fg: 'white',
        bg: 'blue'
      }
    })
  }
}

module.exports = BaseProp
