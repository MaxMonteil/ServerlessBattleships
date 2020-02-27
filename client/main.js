class CanvasBitmap {
  constructor (bitString) {
    const MAX_BITWISE_LENGTH = 32
    this.bitString = bitString
    this.segments = this._divideBitString(bitString, MAX_BITWISE_LENGTH)
  }

  _divideBitString (bitString, length) {
    let result = [], i = 0
    while (true)  {
        result.push(bitString.substring(i * length, (i * length) + length))
        if (result[result.length - 1].length < l) break
        i++
    }
    return result
  }
}

class Board {
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
    for (let i = 0; i < 100; i++) {
      const s = new Square(i, this.squareDef)
      this.ctx.fillRect(s.x, s.y, s.width, s.height)
      this.ctx.strokeRect(s.x, s.y, s.width, s.height)

      this.squares.push(s)
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
    for (let i = 0; i < this.squares.length; i++) {
      if (this.squares[i].wasClicked({ clientX: adjustedX, clientY: adjustedY })) {
        this.squares[i].recolor(this.ctx, 'red')
        break
      }
    }
  }
}

class Square {
  constructor (i, getSquare) {
    this.id = i

    const { x, y, width, height } = getSquare(i)
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  wasClicked ({ clientX, clientY }) {
    return clientX > this.x && clientX <= (this.x + this.width) &&
    clientY > this.y && clientY <= (this.y + this.height)
  }

  recolor (ctx, fill = 'lightblue', stroke = 'white') {
    ctx.fillStyle = fill
    ctx.strokeStyle = stroke
    ctx.fillRect(this.x, this.y, this.width, this.height)
    ctx.strokeRect(this.x, this.y, this.width, this.height)
  }
}

function run () {
  const board = new Board(500, 10, '#canvas')
  board.drawBoard()
}

window.onload = run
