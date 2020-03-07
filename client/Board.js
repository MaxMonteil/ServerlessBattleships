import Square from './Square.js'

export default class Board {
  constructor (dimensions, divisions, canvasID) {
    this.divisions = divisions
    this.size = divisions ** 2

    this.canvas = document.querySelector(canvasID)
    this.ctx = canvas.getContext('2d')
    this.canvasBounds = canvas.getBoundingClientRect()
    canvas.addEventListener('click', e => this._handleClick(e))

    this.squareDef = this._defSquare(dimensions, divisions)
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

  // This function draws a smaller or equal sized square
  // on top of another
  drawBitmap (bitmap, color, start = 0, options = {}) {
    const bits = bitmap.bits
    const mapSize = Math.sqrt(bits.length)
    // the indices of the smaller square on the board need an additional
    // offset for each row
    const rowStep = this.divisions - mapSize

    let indices = []
    for (let i = 0; i < bits.length; i++) {
      if (bits[i]) {
        // this gets us the indices of the smaller square relative to the bigger one
        indices.push(start + i + (rowStep * Math.floor(i / mapSize)))
      }
    }

    // avoid extra calcs when it makes sense (both maps the same size, not based on user input)
    if (options.skipCheck) {
      for (const i of indices) if (i < this.size) this.squares[i].recolor(this.ctx, color)
      return
    }

    // Out of bounds check along both axes
    const yCheck = indices[indices.length - 1] < this.size
    // along the x axis we need to check for horizontal alignment,
    // for horizontal we make sure the first and last indices are on the same row
    const xCheck = ((indices[0] / this.divisions) >> 0) === ((indices[indices.length - 1] / this.divisions) >> 0) ||
      // for vertical we make sure the indices increment by row lenght (aka division)
      indices.every(i => ((i - indices[0]) % this.divisions) === 0)

    if (yCheck && xCheck) {
      for (const i of indices) this.squares[i].recolor(this.ctx, color)
      return true
    } else {
      return false
    }
  }

  // curried function to manage generating each square's data
  _defSquare (dimensions, divs) {
      return i => ({
        x: ((i % divs) * dimensions / divs) + dimensions / divs, // ((remainder) * row width) + left offset
        y: ((i / divs >> 0) * dimensions / divs) + dimensions / divs, // ((interger division) * col width) + top offset
        width: dimensions / divs,
        height: dimensions / divs,
      })
  }

  _handleClick (e) {
    const adjustedX = e.clientX - this.canvasBounds.x
    const adjustedY = e.clientY - this.canvasBounds.y
    for (let i = 0; i < this.size; i++) {
      if (this.squares[i].wasClicked({ clientX: adjustedX, clientY: adjustedY })) {

        this.canvas.dispatchEvent(new CustomEvent('boardClicked', { detail: i }))
        break
      }
    }
  }
}
