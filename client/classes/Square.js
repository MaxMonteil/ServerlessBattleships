export default class Square {
  constructor (i, ctx, dimensions, divs, fill, stroke) {
    this.id = i

    this.ctx = ctx

    this.x = ((i % divs) * dimensions / divs) // ((remainder) * row width)
    this.y = ((i / divs >> 0) * dimensions / divs) // ((interger division) * col width)

    this.width = dimensions / divs
    this.height = dimensions / divs

    this.fill = fill
    this.stroke = stroke
  }

  wasClicked ({ clientX, clientY }) {
    return clientX > this.x && clientX <= (this.x + this.width) &&
      clientY > this.y && clientY <= (this.y + this.height)
  }

  recolor (fill = this.fill, stroke = this.stroke) {
    this.fill = fill
    this.ctx.fillStyle = fill
    this.ctx.fillRect(this.x, this.y, this.width, this.height)

    this.stroke = stroke
    this.ctx.strokeStyle = stroke
    this.ctx.strokeRect(this.x, this.y, this.width, this.height)
  }

  flash (color, delay = 150) {
    const oldFill = this.fill
    this.recolor(color)

    const id = window.setTimeout(() => {
      this.recolor(oldFill)
      window.clearTimeout(id)
    }, delay)
  }
}
