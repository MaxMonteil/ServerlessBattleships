const defSquare = (size, divs) => i => ({
  x: ((i/divs>>0) * size/divs) + size/divs, // ((interger division) * col width) + top offset
  y: ((i%divs) * size/divs) + size/divs, // ((remainder) * row width) + left offset
  width: size/divs,
  height: size/divs,
})

function drawGrid (ctx, SIZE, DIVS = 10) {
  // ctx.font = '40px serif'
  // ctx.textAlign = 'center'

  // for (let j = 1; j < 11; j++) {
  //   ctx.fillText(String.fromCharCode(64 + j), 20 + (j*51), 35)
  // }

  // for (let j = 1; j < 11; j++) {
  //   ctx.fillText(j, 25, 32 + (j*51))
  // }

  const getSquare = defSquare(SIZE, DIVS)

  ctx.fillStyle = 'lightblue'
  ctx.strokeStyle = 'white'
  for (let i = 0; i < 100; i++) {
    const { x, y, width, height } = getSquare(i)
    ctx.fillRect(x, y, width, height)
    ctx.strokeRect(x, y, width, height)
  }
}
function run () {
  const canvas = document.querySelector('#canvas')
  const ctx = canvas.getContext('2d')
  const SIZE = 500
  drawGrid(ctx, SIZE)

  canvas.addEventListener('click', e => console.log(e.clientX, e.clientY))
}

window.onload = run
