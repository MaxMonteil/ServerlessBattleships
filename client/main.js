class Bitmap {
  constructor (bitString) {
    const MAX_BITWISE_LENGTH = 32

    if (typeof bitString === 'string') {
      this.segments = this._divideBitString(bitString, MAX_BITWISE_LENGTH)
    } else if (Array.isArray(bitString) && typeof bitString[0] === 'string') {
      this.segments = bitString
    } else {
      throw new Error('Invalid Bitstring. Type must be Array<String> or String')
    }
  }

  get bitString () {
    return this.segments.join('')
  }

  get bits () {
    return this.bitString.split('').map(bit => parseInt(bit))
  }

  _divideBitString (bitString, length) {
    // bit operations work on a maximum of 32 bits so this divides the
    // 100 char length string into arrays of size <= 32
    let result = [], i = 0
    while (true)  {
        result.push(bitString.substring(i * length, (i * length) + length))
        if (result[result.length - 1].length < length) break
        i++
    }
    return result
  }

  // Bitmap operations
  // We always assume A.length === B.length
  static OR = (A, B) => Bitmap._bitwise(A, B, ((A, B) => A | B))
  static AND = (A, B) => Bitmap._bitwise(A, B, ((A, B) => A & B))
  static XOR = (A, B) => Bitmap._bitwise(A, B, ((A, B) => A ^ B))
  // Same as before but we use >>> to get a non-negative/unsigned result
  static NOT = A => new Bitmap(A.segments.map(segment => ((~ parseInt(segment, 2) >>> 0).toString(2))))

  static _bitwise (A, B, op) {
    return new Bitmap(A.segments.map((segment, i) => {
      // the strings need to be parsed into integers for bitwise operations
      return op(parseInt(segment, 2), parseInt(B.segments[i], 2))
        // then put back as a string for storage
        .toString(2)
        // but this trims upto the most significant bit
        // so we pad it back to it's orginal length
        .padStart(segment.length, '0')
    }))
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
