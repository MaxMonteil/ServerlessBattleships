export default class Bitmap {
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
