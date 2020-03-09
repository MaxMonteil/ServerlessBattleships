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
      if (String.fromCharCode(e.keyCode) === 'S') console.log(this.shipMap.bitString)
    })

    this.selectShip(this.ships.Carrier)
  }

  rotateSelectedShip () {
    if (this.selectedShip.anchor !== null) {
      this.shipMap.update(this.removeShip(this.selectedShip))
      this.drawShips()
    }

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
      const { placementValid, map } = this.placeShip(ship, square)
      if (placementValid) {
        this.shipMap.update(map)
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

  placeShip (ship, start) {
    const shipOffset = Ship.getOffsetIndices(ship, start, this.gridDimensions)

    // Check for out-of-bounds along both axes
    const yValid = Math.max(...shipOffset) < this.size
    // if the ship is vertical, we don't need any checks since the width is 1 square
    const xValid = ship.alignment === 'VERTICAL' ||
      // for horizontal we check that each ship square is on the same row
      shipOffset.map(i => (i / this.gridDimensions) >> 0).every((value, _, arr) => value === arr[0])

    const paddedShip = Ship.padBounds(ship, shipOffset, this.size)

    // Check for collisions against other ships but allow if ship overlaps with itself
    const collisions = !Bitmap.EQ(Bitmap.AND(new Bitmap(this.removeShip(ship, false)), paddedShip), Bitmap.FALSE(this.size))

    if (!yValid || !xValid || collisions) return { placementValid: false, map: null }

    // this ship is already somewhere on the map
    if (ship.anchor !== null) this.shipMap.update(this.removeShip(ship))

    ship.anchor = start
    return {
      placementValid: true,
      map: Bitmap.OR(this.shipMap, paddedShip).bitString,
    }
  }

  removeShip (ship, removeAnchor = true) {
    const padShip = Ship.padBounds(ship, Ship.getOffsetIndices(ship, ship.anchor, this.gridDimensions), this.size)
    if (removeAnchor) ship.anchor = null
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
