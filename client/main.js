import Board from './Board.js'
import Square from './Square.js'
import Bitmap from './Bitmap.js'
import Ship from './Ship.js'

function run () {
  const board = new Board(500, 10, '#canvas')
  board.drawBoard()

  const shipBoard = new Bitmap('0'.repeat(100))
  const Carrier = new Ship(5)

  const ships = Bitmap.OR(shipBoard, Carrier.bounds)

  board.drawBitmap(ships, 'black')

  const attacks = new Bitmap('0'.repeat(71) + '11' + '0'.repeat(27))

  // Ships & Attacks
  const hits = Bitmap.AND(ships, attacks)
  board.drawBitmap(hits, 'green')

  // ~Ships & Attacks
  const misses = Bitmap.AND(Bitmap.NOT(ships), attacks)
  board.drawBitmap(misses, 'lightgray')
}

window.onload = run
