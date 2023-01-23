/**
 * @param {Number} x
 * @param {Number} y
 */
const Vector2D = function (x, y) {
  this.x = x
  this.y = y
  return this
}

/**
 * @param {Vector2D} vec
 */
Vector2D.fromVector2D = function (vec) {
  return new Vector2D(vec.x, vec.y)
}

module.exports = {
  Vector2D
}
