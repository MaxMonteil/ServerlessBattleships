import Board from './Board.js'
import Square from './Square.js'
import Bitmap from './Bitmap.js'

function run () {
  const board = new Board(500, 10, '#canvas')
  board.drawBoard()

  let ships = new Bitmap('0'.repeat(70) + '11' + '0'.repeat(28))

  let attacks = new Bitmap('0'.repeat(71) + '11' + '0'.repeat(27))
  board.drawBitmap(ships, 'black')

  // Ships & Attacks
  let hits = Bitmap.AND(ships, attacks)
  board.drawBitmap(hits, 'green')

  // ~Ships & Attacks
  let misses = Bitmap.AND(Bitmap.NOT(ships), attacks)
  board.drawBitmap(misses, 'lightgray')
}

window.onload = run
