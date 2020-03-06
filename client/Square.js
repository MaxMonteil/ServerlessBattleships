export default class Square {
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
