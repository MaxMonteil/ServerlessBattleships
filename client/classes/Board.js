import Square from './Square.js'

export const GRID_DIVISIONS = 10
export const GRID_FILL = 'white'
export const GRID_STROKE = 'gray'

export default class Board {
  constructor (pixelDimensions, canvasID, clickEvent) {
    this.pixelDimensions = pixelDimensions
    this.size = GRID_DIVISIONS ** 2

    this.grid = {
      divisions: GRID_DIVISIONS,
      fill: GRID_FILL,
      stroke: GRID_STROKE,
    }

    this.canvas = document.querySelector(canvasID)
    this.ctx = this.canvas.getContext('2d')
    this.canvas.addEventListener('click', e => this._handleClick(e))

    this.squares = []

    this.clickEvent = clickEvent
  }

  drawBoard () {
    this.ctx.fillStyle = GRID_FILL
    this.ctx.strokeStyle = GRID_STROKE
    for (let i = 0; i < this.size; i++) {
      const s = new Square(i, this.ctx, this.pixelDimensions, GRID_DIVISIONS, GRID_FILL, GRID_STROKE)
      s.recolor()

      this.squares.push(s)
    }
  }

  drawMap (map, style, erase = false) {
    const { fill, stroke } = { fill: GRID_FILL, stroke: GRID_STROKE, ...style }
    const bits = map.bits

    for (let i = 0; i < bits.length; i++) {
      if (bits[i]) this.squares[i].recolor(fill, stroke)
      if(!bits[i] && erase) this.squares[i].recolor(GRID_FILL, GRID_STROKE)
    }
  }

  _handleClick (e) {
    const { x, y } = this.canvas.getBoundingClientRect()
    const adjustedX = e.clientX - x
    const adjustedY = e.clientY - y

    for (let i = 0; i < this.size; i++) {
      if (this.squares[i].wasClicked({ clientX: adjustedX, clientY: adjustedY })) {
        this.canvas.dispatchEvent(new CustomEvent(this.clickEvent, { detail: i }))
        break
      }
    }
  }
}
