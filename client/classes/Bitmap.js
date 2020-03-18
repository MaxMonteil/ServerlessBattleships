const MAX_BITWISE_LENGTH = 32

export default class Bitmap {
  constructor (bitString) {
    this.segments = []
    this.length = null

    this.update(bitString)
  }

  update (bitString) {
    if (typeof bitString === 'string') {
      this.length = bitString.length
      this.segments = this._divideBitString(bitString, MAX_BITWISE_LENGTH)
    } else if (Array.isArray(bitString) && typeof bitString[0] === 'string') {
      this.length = bitString.join('').length
      this.segments = bitString
    } else {
      throw new Error('Invalid Bitstring. Type must be Array<String> or String')
    }
  }

  get bitString () { return this.segments.join('') }

  get bits () { return this.bitString.split('').map(bit => parseInt(bit)) }

  _divideBitString (bitString, length) {
    // bit operations work on a maximum of 32 bits so this divides the
    // 100 char length string into arrays of size <= 32
    const result = []
    let i = 0
    while (true) {
      result.push(bitString.substring(i * length, (i * length) + length))
      if (result[result.length - 1].length < length) break
      i++
    }
    return result
  }

  // Booleans
  static TRUE = size => new Bitmap('1'.repeat(size))
  static FALSE = size => new Bitmap('0'.repeat(size))

  // Comparison
  static EQ = (A, B) => A.bitString === B.bitString

  // Bitmap operations
  // NOT is a unary operator and doesn't need padding
  static NOT = A => new Bitmap(A.bits.map(bit => bit ? 0 : 1).join(''))

  static OR = (A, B) => Bitmap._bitwise(A, B, (A, B) => A | B)
  static AND = (A, B) => Bitmap._bitwise(A, B, (A, B) => A & B)
  static XOR = (A, B) => Bitmap._bitwise(A, B, (A, B) => A ^ B)

  static _bitwise (A, B, op) {
    // Bitwise ops do not have an order but the bitmaps may have different lengths,
    // to help with padding we make sure B always represents the shorter one
    if (B.segments.length > A.segments.length) {
      const tmp = B
      B = A
      A = tmp
    }

    return new Bitmap(A.segments.map((segment, i) => {
      // if the segment is empty return a 0 string of matching length
      const paddedB = typeof B.segments[i] === 'undefined' ? '0'.repeat(segment.length)
        // if the B segment is shorter, pad it to match the A segment
        : B.segments[i].length < segment.length ? B.segments[i].padEnd(segment.length, '0')
        // no padding needed
          : B.segments[i]

      // the strings need to be parsed into integers for bitwise operations
      // then we use >>> to get a non-negative/unsigned result
      return (op(parseInt(segment, 2), parseInt(paddedB, 2)) >>> 0)
        // now we turn the result back into a string for storage,
        .toString(2)
        // but this trims the result down to the most significant bit
        // so we pad it back to its orginal length
        .padStart(segment.length, '0')
    }))
  }
}
