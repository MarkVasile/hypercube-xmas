const fs = require('node:fs')
const fileContent = fs.readFileSync('input-string.txt', 'utf8')

// The word to search for in the hypercube
const WORD = 'XMAS'

// The input string split into rows
const ROWS = fileContent.split('\n')

// The input concatenated lines, to simplify calculations (no new line characters)
const INPUT = ROWS.join('')

// The size of the hypercube (length of one edge)
const EDGE_LENGTH = ROWS[0].length

// The number of dimensions of our hypercube.
// Note that we need to have (EDGE_LENGTH ^ DIM) rows in the input
const DIM = Math.round(Math.log(ROWS.length) / Math.log(EDGE_LENGTH) + 1)

// The vectors along which to search for the word, in one direction only.
// For the reverse direction, we build the inverse vector.
const DIR = buildPaths(DIM)

// Keep the count of word instances found during the hypercube walk
let wordCount = 0

/**
 * NOTE: input has to be an n-dimensional hypercube, each line of text representing a row of voxles
 * For example, we can write the following 3D matrix with 2x2x2 voxels:
 *
 * ab
 * xa // two rows represent a face slice on the 3D object
 * ay
 * bx // another face slice, this one completes the 2x2x2 cube
 *
 * Similarly, for a 3x3x3 cube we'd have 9 total rows of text, for a 4x4x4x4 we'd have 4^3 = 64 rows of text, etc.

 * Thinking of coordinates themselves, we can visualize a line as being made of voxels
 * that follow each other by exactly +1 or 0 or -1 in any coordinate.
 *
 * Example:
 * X: +1 +1 +1 ... one line along the x axis
 * XY: one diagonal on the XY plane
 *  X: +1 +1 +1 ...
 *  Y: +1 +1 +1 ...
 * XYZ: one diagonal on the XYZ plane
 *  X: -1 -1 -1 ...
 *  Y: +1 +1 +1 ...
 *  Z: -1 -1 -1 ...
 *
 */
function buildPaths(D) {
  const cartesianProduct = (arrays) => arrays.reduce((acc, curr) => acc.flatMap(a => curr.map(b => [...a, b])), [[]])

  // Create every possible combination of values from the set [-1, 0, 1].
  // These combinations represent our walking-path vectors.
  const baseSet = [-1, 0, 1]
  const combinations = cartesianProduct(Array(DIM).fill(baseSet))

  // Filter out the [0, 0, ... 0] row, since that represents a null vector (no movement).
  return combinations.filter(row => row.some(value => value !== 0))
}

/**
 * Walking algorithm:
 *
 * 1. start at the beginning of the input matrix, which is a 1D string
 * 2. compute the position in the hypercube, for the current letter
 * 3. for each walk-vector attempt to advance in that vector direction
 * 4. if there is a voxel at the next position, look at the word formed so far along the vector
 * 5. if there is no voxel (out-of-bounds) stop walking on that vector
 * 6. once all walks have stopped, advance to the next letter in the input matrix
 * 7. go to (2)
 */
function parse() {
  for (let ix=0; ix<INPUT.length; ix++) {
    const voxel = computePosition(ix, DIM, EDGE_LENGTH)
    console.log(`check from index ${ix}, DIM ${DIM} LEN ${EDGE_LENGTH} -> ${voxel}`)
    for (let vwalk = 0; vwalk < DIR.length; vwalk++) {
      searchInDirection(voxel, DIR[vwalk])
    }
  }
}

/**
 * @param int ix = the index in the input string
 */
function computePosition(ix, D, len) {
  let coord = Array(D + 1).fill(0)
  for (let d = D - 1; d >= 0; d--) {
    let aggregate = 0
    for (let dn = D - 1; dn >= 0; dn--) {
      aggregate += coord[dn + 1] * Math.pow(len, dn + 1)
    }
    coord[d] = Math.floor((ix - aggregate) / Math.pow(len, d))
  }
  coord.pop()

  return coord
}

/**
 * @param vector pos is the array representing the position in hyperspace
 *
 * NOTE: this function is the inverse function of computePosition
 */
function getLetterAtCoord(pos) {
  let index = 0
  for (let d=0; d<DIM; d++) {
    index += pos[d] * Math.pow(EDGE_LENGTH, d)
  }

  return INPUT[index]
}


/**
 * @param array coord is the coordinate at which to start walking
 * @param vector dir is the direction we want to perform the walk
 */
function searchInDirection(coord, dir) {
  let word_buffer = ''
  let pos = [...coord] // copy coordinates, such that we don't modify them in the parent scope
  while (isValidCoord(pos)) {
    const letter = getLetterAtCoord(pos)
    word_buffer = word_buffer.slice(-1 * WORD.length + 1) + letter
    if (word_buffer === WORD) wordCount++
    for (let d=0; d<DIM; d++) pos[d] += dir[d] // walk to the next voxel in the specified direction
  }
}

function isValidCoord(pos) {
  let outOfBounds = false
  for (let d=0; d<DIM; d++) {
    outOfBounds = outOfBounds || (pos[d] < 0) || (pos[d] >= EDGE_LENGTH)
  }

  return !outOfBounds
}

parse()
console.log(`WORD COUNT: ${wordCount}`)
