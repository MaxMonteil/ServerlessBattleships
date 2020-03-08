import Square from './Square.js'

export default class Board {
  constructor (pixelDimensions, gridDimensions, fill, stroke, canvasID, clickEvent) {
    this.pixelDimensions = pixelDimensions
    this.gridDimensions = gridDimensions
    this.size = gridDimensions ** 2

    this.fill = fill
    this.stroke = stroke

    this.canvas = document.querySelector(canvasID)
    this.ctx = canvas.getContext('2d')
    this.canvasBounds = canvas.getBoundingClientRect()
    canvas.addEventListener('click', e => this._handleClick(e))

    this.squares = []

    this.clickEvent = clickEvent
  }

  drawBoard () {
    this.ctx.font = '40px sans-serif'
    this.ctx.textAlign = 'center'

    for (let i = 1; i < 11; i++) {
      this.ctx.fillText(String.fromCharCode(64 + i), 20 + (i * 51), 35)
      this.ctx.fillText(i, 25, 32 + (i * 51))
    }

    this.ctx.fillStyle = this.fill
    this.ctx.strokeStyle = this.stroke
    for (let i = 0; i < this.size; i++) {
      const s = new Square(i, this.ctx, this.pixelDimensions, this.gridDimensions, this.fill, this.stroke)
      s.recolor()

      this.squares.push(s)
    }
  }

  _handleClick (e) {
    const adjustedX = e.clientX - this.canvasBounds.x
    const adjustedY = e.clientY - this.canvasBounds.y

    for (let i = 0; i < this.size; i++) {
      if (this.squares[i].wasClicked({ clientX: adjustedX, clientY: adjustedY })) {
        this.canvas.dispatchEvent(new CustomEvent(this.clickEvent, { detail: i }))
        break
      }
    }
  }
}
