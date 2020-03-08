import Bitmap from './Bitmap.js'
import Board from './Board.js'
import Ship from './Ship.js'

const CLICK_EVENT = 'shipsBoardClicked'

export default class ShipsBoard extends Board {
  constructor (pixelDimensions, gridDimensions, fill, stroke, canvasID, orientationDisplayID, shipSelectFormID) {
    super(pixelDimensions, gridDimensions, fill, stroke, canvasID, CLICK_EVENT)

    this.shipSelectForm = document.forms[shipSelectFormID]
    this.orientationDisplay = document.querySelector(orientationDisplayID)

    this.shipSelectForm.addEventListener('submit', e => this._handleShipSelection(e))

    this.shipMap = new Bitmap('0'.repeat(this.size))

    this.ships = {
      Carrier: new Ship(5),
      Battleship: new Ship(4),
      Destroyer: new Ship(3),
      Submarine: new Ship(3),
      Patrol: new Ship(2),
    }

    this.selectedShip = null
    this.shipWatcher = null

    // SETUP

    // ROTATION
    window.addEventListener('keydown', e => {
      if (String.fromCharCode(e.keyCode) === 'R') this.rotateSelectedShip()
    })

    this.selectShip(this.ships.Carrier)
  }

  rotateSelectedShip () {
    if (this.selectedShip.anchor !== null) this.shipMap.update(this.removeShip(this.selectedShip))

    this.selectedShip.rotate()
    this.updateOrientation()
  }

  selectShip (target, selector = null) {
    if (target instanceof Ship) {
      this.selectedShip = target
    } else {
      const selection = new FormData(target).get(selector)
      this.selectedShip = this.ships[selection]
    if (this.shipWatcher !== null) this.canvas.removeEventListener(CLICK_EVENT, this.shipWatcher)
    }

    this.watchShip(this.selectedShip)
    this.updateOrientation()
  }

  watchShip (ship) {
    const shipWatcher = ({ detail: square }) => {
      const validPlacement = this.placeShip(ship, square)
      if (validPlacement) {
        this.shipMap.update(validPlacement)
        this.drawShips()
      } else this.squares[square].flash('red')
    }

    this.canvas.addEventListener(CLICK_EVENT, shipWatcher)

    this.shipWatcher = shipWatcher
  }

  drawShips () {
    const bits = this.shipMap.bits

    for (let i = 0; i < this.shipMap.length; i++) {
      if (bits[i]) this.squares[i].recolor(this.selectedShip.color)
      else this.squares[i].recolor(this.fill)
    }
  }

  // TODO comment
  placeShip (ship, start) {
    const shipOffset = Ship.getOffsetIndices(ship, start, this.gridDimensions)

    // Check for out-of-bounds along both axes
    const yValid = Math.max(...shipOffset) < this.size
    // TODO: might not need vertical check since width of ship === 1
    // if the ship is vertical, we make sure the squares are separated by row length (aka division)
    const xValid = shipOffset.every(i => ((i - shipOffset[0]) % this.gridDimensions) === 0) ||
      // for horizontal we check that each ship square is on the same row
      shipOffset.map(i => (i / this.gridDimensions) >> 0).every((value, _, arr) => value === arr[0])

    if (!yValid || !xValid) return false

    // this ship is already somewhere on the map
    if (ship.anchor !== null) this.shipMap.update(this.removeShip(ship))

    ship.anchor = start
    return Bitmap.OR(this.shipMap, Ship.padBounds(ship, shipOffset, this.size)).bitString
  }

  removeShip (ship) {
    const padShip = Ship.padBounds(ship, Ship.getOffsetIndices(ship, ship.anchor, this.gridDimensions), this.size)
    ship.anchor = null
    return Bitmap.AND(this.shipMap, Bitmap.NOT(padShip)).bitString
  }

  updateOrientation () {
    this.orientationDisplay.innerText = this.selectedShip.alignment.toLowerCase()
  }

  _handleShipSelection (e) {
      e.preventDefault()
      this.selectShip(e.target, 'ship_select')
      this.updateOrientation()
  }
}
