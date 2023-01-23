/* eslint-disable */
const Props = require('./props')
const blessed = require('../../node_modules/blessed')
/* eslint-enable */

class SceneItem {
  /**
   * @param {Props.BaseProp} prop
   * @param {Props.BaseProp} parent
   */
  constructor (prop, parent) {
    this.prop = prop
    this.parent = parent ?? null
  }
}

class Scene {
  /**
   * @type {[SceneItem]}
   */
  #props = []

  get props () {
    return this.#props
  }

  /**
   * @param {Number} screenWidth
   * @param {Number} screenHeight
   */
  constructor (screenWidth, screenHeight) {
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
  }

  /**
   * @param {Props.BaseProp} prop
   * @param {blessed.Box} blessedBoxParent
   */
  addProp (prop, blessedBoxParent) {
    this.#props.push(new SceneItem(prop, blessedBoxParent))
  }

  addToBlessedScreen (screen) {
    for (const ix in this.props) {
      const parent = this.props[ix].parent
      const bBox = this.props[ix].prop.blessedBox

      if (parent) {
        parent.blessedBox.append(bBox)
      } else {
        screen.append(bBox)
      }
    }
  }
}

module.exports = Scene
