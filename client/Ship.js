// Types of ships according to the Hasbro Rules
// No.  Name            Size
// 1    Carrier         5
// 2    Battleship      4
// 3    Destroyer       3
// 4    Submarine       3
// 5    Patrol Boat     2
//
// All ships are a straight line,
// they can only be placed vertically or horizontally
import Bitmap from './Bitmap.js'

const ALIGN = {
  'HORIZONTAL': 'HORIZONTAL',
  'VERTICAL': 'VERTICAL',
}

export default class Ship {
  constructor (size, alignment = ALIGN.HORIZONTAL) {
    // top left square of the ship, useful for redrawing it
    this.anchor
    this.size = size
    this.alignment = alignment in ALIGN
      ? alignment
      : ALIGN.HORIZONTAL

    // Ships are aligned to the top left of their bounding box
    // The bounding box is a square matrix of dimensions size x size
    // By the default alignment, that's represented by a top row of 1s
    // This makes rotation equal to the transpose of the matrix
    this.bounds = new Bitmap('1'.repeat(size) + '0'.repeat(size ** 2 - size))
  }

  rotate () {
    let rotatedShip = [...this.bounds.bits]

    // Since ships are exclusively the top row or left column
    // of their bounds, rotation is the transpose of the ship's bounds
    // So we can just switch the top row bits with the left column
    // and skip the corner which doesn't move
    for (let i = 1; i < this.size; i++) {
      let tmp = rotatedShip[i]
      rotatedShip[i] = rotatedShip[i * this.size]
      rotatedShip[i * this.size] = tmp
    }
    this.alignment = this.alignment === ALIGN.HORIZONTAL ? ALIGN.VERTICAL : ALIGN.HORIZONTAL
    this.bounds.update(rotatedShip.join(''))
  }
}
