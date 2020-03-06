import Square from './Square.js'

export default class Board {
  constructor (size, divisions, canvasID) {
    this.size = size
    this.divisions = divisions

    this.canvas = document.querySelector(canvasID)
    this.ctx = canvas.getContext('2d')
    this.canvasBounds = canvas.getBoundingClientRect()
    canvas.addEventListener('click', e => this._handleClick(e))

    this.squareDef = this._defSquare(size, divisions)
    this.squares = []
  }

  drawBoard () {
    this.ctx.font = '40px sans-serif'
    this.ctx.textAlign = 'center'

    for (let i = 1; i < 11; i++) {
      this.ctx.fillText(String.fromCharCode(64 + i), 20 + (i * 51), 35)
      this.ctx.fillText(i, 25, 32 + (i * 51))
    }

    this.ctx.fillStyle = 'lightblue'
    this.ctx.strokeStyle = 'white'
    for (let i = 0; i < this.size; i++) {
      const s = new Square(i, this.squareDef)
      this.ctx.fillRect(s.x, s.y, s.width, s.height)
      this.ctx.strokeRect(s.x, s.y, s.width, s.height)

      this.squares.push(s)
    }
  }

  drawBitmap (bitmap, color) {
    const bits = bitmap.bits

    for (let i = 0; i < this.size; i++) {
      if (bits[i]) this.squares[i].recolor(this.ctx, color)
    }
  }

  // curried function to manage generating each square's data
  _defSquare (size, divs) {
      return i => ({
        x: ((i % divs) * size / divs) + size / divs, // ((remainder) * row width) + left offset
        y: ((i / divs >> 0) * size / divs) + size / divs, // ((interger division) * col width) + top offset
        width: size / divs,
        height: size / divs,
      })
  }

  _handleClick (e) {
    const adjustedX = e.clientX - this.canvasBounds.x
    const adjustedY = e.clientY - this.canvasBounds.y
    for (let i = 0; i < this.size; i++) {
      if (this.squares[i].wasClicked({ clientX: adjustedX, clientY: adjustedY })) {
        this.squares[i].recolor(this.ctx, 'red')
        break
      }
    }
  }
}
