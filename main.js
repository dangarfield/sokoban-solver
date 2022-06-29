const DATA = {
  w: 10,
  h: 10,
  solution: {
    current: 0,
    directions: '',
    states: []
  },
  levels: [],
  current: ''
}

const setupInitialGrid = () => {
  const grid = document.querySelector('.grid')
  grid.innerHTML = ''
  for (let wi = 0; wi < DATA.h; wi++) {
    const row = document.createElement('div')
    row.classList.add('row', `row-${wi}`)
    for (let hi = 0; hi < DATA.w; hi++) {
      const cell = document.createElement('div')
      cell.classList.add('cell', `cell-${wi}-${hi}`)
      cell.setAttribute('data-type', 'floor')
      cell.setAttribute('data-id', `${wi}-${hi}`)
      row.appendChild(cell)
    }
    grid.appendChild(row)
  }
  document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', function (event) {
    const dataType = event.target.getAttribute('data-type')
    console.log('click', event.target, dataType)

    switch (dataType) {
      case 'floor': event.target.setAttribute('data-type', 'wall'); break
      case 'wall': event.target.setAttribute('data-type', 'block'); break
      case 'block': event.target.setAttribute('data-type', 'target'); break
      case 'target': event.target.setAttribute('data-type', 'player'); break
      case 'player': event.target.setAttribute('data-type', 'floor'); break
    }
  }))
  // TEMP TEST
//   document.querySelectorAll('.cell-1-0,.cell-1-1,.cell-1-2,.cell-1-3,.cell-1-4,.cell-1-5,.cell-1-6,.cell-3-5,.cell-3-6,.cell-4-0,.cell-4-1,.cell-4-2,.cell-4-3,.cell-4-4').forEach(cell => {
//     cell.setAttribute('data-type', 'wall')
//   })
//   document.querySelector('.cell-2-1').setAttribute('data-type', 'block')
//   document.querySelector('.cell-2-3').setAttribute('data-type', 'block')
//   document.querySelector('.cell-2-4').setAttribute('data-type', 'target')
//   document.querySelector('.cell-2-5').setAttribute('data-type', 'target')
//   document.querySelector('.cell-2-6').setAttribute('data-type', 'player')
}
const bindClicks = () => {
  document.querySelector('.calc').addEventListener('click', function (event) {
    calculate()
  })
  document.querySelector('.next').addEventListener('click', function (event) {
    if (DATA.solution.current + 1 < DATA.solution.states.length) {
      DATA.solution.current++
      displayState(DATA.solution.states[DATA.solution.current])
    }
  })
  document.querySelector('.prev').addEventListener('click', function (event) {
    if (DATA.solution.current > 0) {
      DATA.solution.current--
      displayState(DATA.solution.states[DATA.solution.current])
    }
  })
  document.querySelector('.save').addEventListener('click', async function (event) {
    await save()
    await loadLevel(DATA.current)
    console.log('DATA', DATA)
  })

  document.querySelector('.new').addEventListener('click', async function (event) {
    const levelName = window.prompt('New grid name', DATA.current)
    if (levelName !== null) {
      const gridWidthText = window.prompt('Grid size, eg 8x8', '8x8')
      if (gridWidthText !== null) {
        DATA.current = levelName
        const gridWidthTextSplit = gridWidthText.match(/(?:\d+\.)?\d+/g)
        DATA.w = parseInt(gridWidthTextSplit[0])
        DATA.h = parseInt(gridWidthTextSplit[1])
        setupInitialGrid()
        await save()
        console.log('new', DATA.w, DATA.h)
        await loadLevel(levelName)
        console.log('DATA', DATA)
      }
    }
  })

  document.querySelector('.load-select').addEventListener('change', function (event) {
    console.log('.load-select change', event.target.value)
    loadLevel(event.target.value)
  })
  document.addEventListener('keyup', function (e) {
    // console.log('e', e.key)
    if (e.key === 'ArrowLeft' || e.key === 'a') {
      executeManualMove('l')
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
      executeManualMove('r')
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
      executeManualMove('u')
    } else if (e.key === 'ArrowDown' || e.key === 's') {
      executeManualMove('d')
    } else if (e.key === 'Escape' || e.key === ' ') {
      loadLevel(DATA.current)
    }
  })

  // Speech
//   const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition
//   const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList
//   const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent

//   const directions = [ 'up', 'down', 'left', 'right', 'restart', 'start again' ]
//   const grammar = '#JSGF V1.0; grammar direction; public <direction> = ' + directions.join(' | ') + ' ;'

//   const recognition = new SpeechRecognition()
//   const speechRecognitionList = new SpeechGrammarList()
//   speechRecognitionList.addFromString(grammar, 1)

//   recognition.grammars = speechRecognitionList
//   recognition.continuous = true
//   recognition.lang = 'en-US'
//   recognition.interimResults = false
//   recognition.maxAlternatives = 0

//   recognition.start()

//   recognition.onresult = function (event) {
//     console.log('recognition.onresult', event)
//     const lastResult = event.results[event.results.length - 1]
//     const direction = lastResult[lastResult.length - 1].transcript
//     const isFinal = lastResult.isFinal
//     // diagnostic.textContent = 'Result received: ' + color + '.'
//     // bg.style.backgroundColor = color
//     console.log('Confidence: ' + event.results[0][0].confidence, direction, isFinal)

//     if (direction.includes('left')) {
//       executeManualMove('l')
//     } else if (direction.includes('right')) {
//       executeManualMove('r')
//     } else if (direction.includes('up')) {
//       executeManualMove('u')
//     } else if (direction.includes('down')) {
//       executeManualMove('d')
//     } else if (direction.includes('start')) {
//       loadLevel(DATA.current)
//     }
//   }
}
const save = async () => {
  const text = gridToText()
  console.log('save', DATA.current, text)
  const savedLevels = JSON.parse(window.localStorage.getItem('sok'))

  const level = savedLevels.find(l => l.name === DATA.current)
  console.log('level', level)
  if (level === undefined) {
    const newLevel = {name: DATA.current, grid: text, solution: ''}
    savedLevels.push(newLevel)
  } else {
    level.grid = text
  }
  window.localStorage.setItem('sok', JSON.stringify(savedLevels))
  await loadLevelList()
}
const getGridState = () => {
  const state = []
  for (let wi = 0; wi < DATA.h; wi++) {
    const row = []
    for (let hi = 0; hi < DATA.w; hi++) {
      const dataType = document.querySelector(`.cell-${wi}-${hi}`).getAttribute('data-type')
      row.push(dataType)
    }
    state.push(row)
  }
  return state
}
const getPlayerPos = (state) => {
  for (let wi = 0; wi < DATA.h; wi++) {
    for (let hi = 0; hi < DATA.w; hi++) {
      if (state[wi][hi].includes('player')) {
        return {y: wi, x: hi}
      }
    }
  }
}
const getTargetPos = (x, y, direction) => {
  if (direction.toLowerCase() === 'u') {
    return {player: {x: x, y: y - 1}, box: {x: x, y: y - 2}}
  } else if (direction.toLowerCase() === 'd') {
    return {player: {x: x, y: y + 1}, box: {x: x, y: y + 2}}
  } else if (direction.toLowerCase() === 'l') {
    return {player: {x: x - 1, y: y}, box: {x: x - 2, y: y}}
  } else if (direction.toLowerCase() === 'r') {
    return {player: {x: x + 1, y: y}, box: {x: x + 2, y: y}}
  }
}
const isEnd = (state) => {
  const blockCount = state.flat().filter(dataType => dataType === 'block').length
  const targetBlockCount = state.flat().filter(dataType => dataType === 'target-block').length
  //   console.log('isEnd', state.flat(), blockCount, targetBlockCount)
  if (blockCount === 0 && targetBlockCount > 0) {
    return true
  } else {
    return false
  }
}
const executeManualMove = (direction) => {
  const nextState = calculateNextStateFromDirection(direction, getGridState())
  displayState(nextState)
  if (isEnd(nextState)) {
    setTimeout(function () {
    //   window.alert('You win')
      const currentLevelIndex = DATA.levels.findIndex(l => l.name === DATA.current)
      console.log('currentLevelIndex', currentLevelIndex)
      if (currentLevelIndex + 1 < DATA.levels.length) {
        loadLevel(DATA.levels[currentLevelIndex + 1].name)
      }
    }, 100)
  }
}
const calculateNextStateFromDirection = (direction, currentState) => {
//   console.log('currentState', currentState)
  const nextState = JSON.parse(JSON.stringify(currentState))
  const playerPos = getPlayerPos(nextState)
  const targetPos = getTargetPos(playerPos.x, playerPos.y, direction)
  //   const playerCellDataType = nextState[playerPos.y][playerPos.x]
  const targetPlayerCellDataType = nextState[targetPos.player.y][targetPos.player.x]
  //   const targetBoxCellDataType = nextState[targetPos.box.y][targetPos.box.x]
  //   console.log('direction', direction, nextState, playerPos, targetPos, playerCellDataType, targetPlayerCellDataType, targetBoxCellDataType)
  if (targetPlayerCellDataType === 'target') {
    nextState[targetPos.player.y][targetPos.player.x] = 'target-player'
    nextState[playerPos.y][playerPos.x] = nextState[playerPos.y][playerPos.x] === 'target-player' ? 'target' : 'floor'
  }
  if (targetPlayerCellDataType === 'floor') {
    nextState[targetPos.player.y][targetPos.player.x] = 'player'
    nextState[playerPos.y][playerPos.x] = nextState[playerPos.y][playerPos.x] === 'target-player' ? 'target' : 'floor'
  }
  if (targetPlayerCellDataType === 'block') {
    if (nextState[targetPos.box.y][targetPos.box.x] === 'wall' || nextState[targetPos.box.y][targetPos.box.x].includes('block')) {
      // No move
    } else {
      nextState[targetPos.player.y][targetPos.player.x] = 'player'
      nextState[playerPos.y][playerPos.x] = nextState[playerPos.y][playerPos.x] === 'target-player' ? 'target' : 'floor'
      nextState[targetPos.box.y][targetPos.box.x] = nextState[targetPos.box.y][targetPos.box.x] === 'target' ? 'target-block' : 'block'
    }
  }
  if (targetPlayerCellDataType === 'target-block') {
    if (nextState[targetPos.box.y][targetPos.box.x] === 'wall' || nextState[targetPos.box.y][targetPos.box.x].includes('block')) {
      // No move
    } else {
      nextState[targetPos.player.y][targetPos.player.x] = 'target-player'
      nextState[playerPos.y][playerPos.x] = nextState[playerPos.y][playerPos.x] === 'target-player' ? 'target' : 'floor'
      nextState[targetPos.box.y][targetPos.box.x] = nextState[targetPos.box.y][targetPos.box.x] === 'target' ? 'target-block' : 'block'
    }
  }
  return nextState
}
const populateSolutionStates = () => {
  DATA.solution.states = [getGridState()]
  console.log('DATA.solution.states', DATA.solution.states)
  DATA.solution.directions.split('').forEach(direction => {
    const nextState = calculateNextStateFromDirection(direction, DATA.solution.states[DATA.solution.states.length - 1])
    DATA.solution.states.push(nextState)
  })
  DATA.solution.current = 0
  console.log('DATA.solution END', DATA.solution)
}
const gridToText = () => {
  let textList = []
  for (let wi = 0; wi < DATA.h; wi++) {
    let text = []
    for (let hi = 0; hi < DATA.w; hi++) {
      const cell = document.querySelector(`.cell-${wi}-${hi}`)
      const dataType = cell.getAttribute('data-type')
      switch (dataType) {
        case 'wall': text += '#'; break
        case 'floor': text += ' '; break
        case 'block': text += 'B'; break
        case 'target': text += '.'; break
        case 'player': text += '&'; break
      }
    }
    // if (wi + 1 < DATA.w) text += '\n'
    textList.push(text)
  }
  console.log('text:')
  console.log(textList)
  return textList
}
const displayState = (state) => {
//   console.log('displayState', state)
  for (let wi = 0; wi < state.length; wi++) {
    const row = state[wi]
    for (let hi = 0; hi < row.length; hi++) {
      const cell = document.querySelector(`.cell-${wi}-${hi}`)
      cell.setAttribute('data-type', state[wi][hi])
    }
  }
}
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const calculate = async () => {
  console.log('calculate')
  document.querySelector('.calc').setAttribute('disabled', 'disabled')
  await sleep(100) // To allow button to be disabled
  const gridText = gridToText()
  const gridWidth = gridText[0].length
  const level = DATA.levels.find(l => l.name === DATA.current)
  const savedGrid = level.grid.map(l => l.padEnd(gridWidth, ' '))

  if (gridText.join('\n') === savedGrid.join('\n') && level.solution !== '') {
    console.log('calcuate cached', gridText, savedGrid)
    DATA.solution.directions = level.solution
  } else {
    console.log('calcuate', gridText, savedGrid)
    const solveSokodanRes = DATA.solveSokodan('astar', gridText)
    console.log('solveSokodanRes', solveSokodanRes, solveSokodanRes.toJs())

    const solution = solveSokodanRes.toJs()[0]

    const savedLevels = JSON.parse(window.localStorage.getItem('sok'))
    const savedLevel = savedLevels.find(l => l.name === DATA.current)
    console.log('savedLevels', savedLevels, savedLevel)

    if (savedLevel === undefined) {
      savedLevels.push({name: DATA.current, grid: gridText, solution})
    } else {
      savedLevel.solution = solution
    }
    window.localStorage.setItem('sok', JSON.stringify(savedLevels))
    level.solution = solution
    DATA.solution.directions = solution
  }

  populateSolutionStates()
  document.querySelector('.calc').removeAttribute('disabled')
  document.querySelector('.prev').classList.remove('d-none')
  document.querySelector('.next').classList.remove('d-none')
}
const loadLevelList = async () => {
  const req = await fetch('/levels.txt')
  const res = await req.text()
  const levels = res.split('Level:').filter(t => t !== '').map(l => {
    let grid = l.split('\n').filter(t => t !== '')
    let name = grid.shift().trim()
    let solution = ''
    if (name.includes('|')) {
      const nameSplit = name.split('|')
      name = nameSplit[0].trim()
      solution = nameSplit[1].trim()
    }
    if (grid.length === 0) {
      grid = Array(8).fill(' '.repeat(8))
    }
    return {name, solution, grid}
  })

  if (window.localStorage.getItem('sok') === null) {
    window.localStorage.setItem('sok', JSON.stringify([]))
  }

  const savedLevels = JSON.parse(window.localStorage.getItem('sok'))
  console.log('savedLevels', savedLevels)
  savedLevels.forEach(savedLevel => {
    const level = levels.find(l => l.name === savedLevel.name)
    console.log('savedLevel', savedLevel, level)
    if (level === undefined) {
      levels.push(savedLevel)
    } else {
      level.grid = savedLevel.grid
      level.solution = savedLevel.solution
    }
  })
  levels.sort((a, b) => a.name.localeCompare(b.name))

  DATA.levels = levels
  console.log('DATA.levels', DATA.levels)
  const loadSelect = document.querySelector('.load-select')
  loadSelect.innerHTML = ''
  DATA.levels.forEach(level => {
    const option = document.createElement('option')
    option.setAttribute('value', level.name)
    option.innerText = level.name
    loadSelect.append(option)
  })
}
const convertToDataType = (sign) => {
  switch (sign) {
    case ' ': return 'floor'
    case '#': return 'wall'
    case 'B': return 'block'
    case '.': return 'target'
    case '&': return 'player'
    case 'X': return 'target-block'
    case '%': return 'target-player'
  }
  return 'floor'
}
const loadLevel = async (levelName) => {
  const level = DATA.levels.filter(l => l.name === levelName)[0]
  console.log('loadLevel res', levelName, level)
  DATA.current = levelName
  DATA.h = level.grid.length
  //   console.log('DATA.h', DATA.h)
  DATA.w = Math.max(...level.grid.map(row => row.replace('\n', '').split('').length))
  //   console.log('DATA.w', DATA.w)
  setupInitialGrid()
  for (let wi = 0; wi < level.grid.length; wi++) {
    const row = level.grid[wi].replace('\n', '').split('')
    for (let hi = 0; hi < row.length; hi++) {
      const cellValue = row[hi]
      const dataType = convertToDataType(cellValue)
      //   console.log(wi, hi, cellValue, dataType)
      document.querySelector(`.cell-${wi}-${hi}`).setAttribute('data-type', dataType)
    }
  }
  document.querySelector('.load-select').value = levelName
  document.querySelector('.prev').classList.add('d-none')
  document.querySelector('.next').classList.add('d-none')
}
const initSolver = async () => {
  let pyodide = await window.loadPyodide()
  console.log(pyodide.runPython(`
        import sys
        sys.version
    `))
  console.log(pyodide.runPython('print(1 + 2)'))
  await pyodide.loadPackage(['numpy', 'micropip'])
  const solveSokodan = pyodide.runPython(`
import micropip
import sys
import collections
import numpy as np
import time

gameState = ''
posWalls = ''
posGoals = ''

class PriorityQueue:
    """Define a PriorityQueue data structure that will be used"""
    def  __init__(self):
        self.Heap = []
        self.Count = 0

    def push(self, item, priority):
        entry = (priority, self.Count, item)
        PriorityQueue.heappush(self.Heap, entry)
        self.Count += 1

    def pop(self):
        (_, _, item) = PriorityQueue.heappop(self.Heap)
        return item

    def isEmpty(self):
        return len(self.Heap) == 0

    # Code taken from heapq
    @staticmethod
    def heappush(heap, item):
        """Push item onto heap, maintaining the heap invariant."""
        heap.append(item)
        PriorityQueue._siftdown(heap, 0, len(heap)-1)

    @staticmethod
    def heappop(heap):
        """Pop the smallest item off the heap, maintaining the heap invariant."""
        lastelt = heap.pop()    # raises appropriate IndexError if heap is empty
        if heap:
            returnitem = heap[0]
            heap[0] = lastelt
            PriorityQueue._siftup(heap, 0)
            return returnitem
        return lastelt

    @staticmethod
    def _siftup(heap, pos):
        endpos = len(heap)
        startpos = pos
        newitem = heap[pos]
        # Bubble up the smaller child until hitting a leaf.
        childpos = 2*pos + 1    # leftmost child position
        while childpos < endpos:
            # Set childpos to index of smaller child.
            rightpos = childpos + 1
            if rightpos < endpos and not heap[childpos] < heap[rightpos]:
                childpos = rightpos
            # Move the smaller child up.
            heap[pos] = heap[childpos]
            pos = childpos
            childpos = 2*pos + 1
        # The leaf at pos is empty now.  Put newitem there, and bubble it up
        # to its final resting place (by sifting its parents down).
        heap[pos] = newitem
        PriorityQueue._siftdown(heap, startpos, pos)

    @staticmethod
    def _siftdown(heap, startpos, pos):
        newitem = heap[pos]
        # Follow the path to the root, moving parents down until finding a place
        # newitem fits.
        while pos > startpos:
            parentpos = (pos - 1) >> 1
            parent = heap[parentpos]
            if newitem < parent:
                heap[pos] = parent
                pos = parentpos
                continue
            break
        heap[pos] = newitem
        """Load puzzles and define the rules of sokoban"""

def PosOfPlayer(gameState):
    """Return the position of agent"""
    return tuple(np.argwhere(gameState == 2)[0]) # e.g. (2, 2)

def PosOfBoxes(gameState):
    """Return the positions of boxes"""
    return tuple(tuple(x) for x in np.argwhere((gameState == 3) | (gameState == 5))) # e.g. ((2, 3), (3, 4), (4, 4), (6, 1), (6, 4), (6, 5))

def PosOfWalls(gameState):
    """Return the positions of walls"""
    return tuple(tuple(x) for x in np.argwhere(gameState == 1)) # e.g. like those above

def PosOfGoals(gameState):
    """Return the positions of goals"""
    return tuple(tuple(x) for x in np.argwhere((gameState == 4) | (gameState == 5))) # e.g. like those above

def isEndState(posBox):
    """Check if all boxes are on the goals (i.e. pass the game)"""
    return sorted(posBox) == sorted(posGoals)

def isLegalAction(action, posPlayer, posBox):
    """Check if the given action is legal"""
    xPlayer, yPlayer = posPlayer
    if action[-1].isupper(): # the move was a push
        x1, y1 = xPlayer + 2 * action[0], yPlayer + 2 * action[1]
    else:
        x1, y1 = xPlayer + action[0], yPlayer + action[1]
    return (x1, y1) not in posBox + posWalls

def legalActions(posPlayer, posBox):
    """Return all legal actions for the agent in the current game state"""
    allActions = [[-1,0,'u','U'],[1,0,'d','D'],[0,-1,'l','L'],[0,1,'r','R']]
    xPlayer, yPlayer = posPlayer
    legalActions = []
    for action in allActions:
        x1, y1 = xPlayer + action[0], yPlayer + action[1]
        if (x1, y1) in posBox: # the move was a push
            action.pop(2) # drop the little letter
        else:
            action.pop(3) # drop the upper letter
        if isLegalAction(action, posPlayer, posBox):
            legalActions.append(action)
        else:
            continue
    return tuple(tuple(x) for x in legalActions) # e.g. ((0, -1, 'l'), (0, 1, 'R'))

def updateState(posPlayer, posBox, action):
    """Return updated game state after an action is taken"""
    xPlayer, yPlayer = posPlayer # the previous position of player
    newPosPlayer = [xPlayer + action[0], yPlayer + action[1]] # the current position of player
    posBox = [list(x) for x in posBox]
    if action[-1].isupper(): # if pushing, update the position of box
        posBox.remove(newPosPlayer)
        posBox.append([xPlayer + 2 * action[0], yPlayer + 2 * action[1]])
    posBox = tuple(tuple(x) for x in posBox)
    newPosPlayer = tuple(newPosPlayer)
    return newPosPlayer, posBox

def isFailed(posBox):
    """This function used to observe if the state is potentially failed, then prune the search"""
    rotatePattern = [[0,1,2,3,4,5,6,7,8],
                    [2,5,8,1,4,7,0,3,6],
                    [0,1,2,3,4,5,6,7,8][::-1],
                    [2,5,8,1,4,7,0,3,6][::-1]]
    flipPattern = [[2,1,0,5,4,3,8,7,6],
                    [0,3,6,1,4,7,2,5,8],
                    [2,1,0,5,4,3,8,7,6][::-1],
                    [0,3,6,1,4,7,2,5,8][::-1]]
    allPattern = rotatePattern + flipPattern

    for box in posBox:
        if box not in posGoals:
            board = [(box[0] - 1, box[1] - 1), (box[0] - 1, box[1]), (box[0] - 1, box[1] + 1),
                    (box[0], box[1] - 1), (box[0], box[1]), (box[0], box[1] + 1),
                    (box[0] + 1, box[1] - 1), (box[0] + 1, box[1]), (box[0] + 1, box[1] + 1)]
            for pattern in allPattern:
                newBoard = [board[i] for i in pattern]
                if newBoard[1] in posWalls and newBoard[5] in posWalls: return True
                elif newBoard[1] in posBox and newBoard[2] in posWalls and newBoard[5] in posWalls: return True
                elif newBoard[1] in posBox and newBoard[2] in posWalls and newBoard[5] in posBox: return True
                elif newBoard[1] in posBox and newBoard[2] in posBox and newBoard[5] in posBox: return True
                elif newBoard[1] in posBox and newBoard[6] in posBox and newBoard[2] in posWalls and newBoard[3] in posWalls and newBoard[8] in posWalls: return True
    return False

"""Implement all approcahes"""

def breadthFirstSearch():
    """Implement breadthFirstSearch approach"""
    beginBox = PosOfBoxes(gameState)
    beginPlayer = PosOfPlayer(gameState)

    startState = (beginPlayer, beginBox) # e.g. ((2, 2), ((2, 3), (3, 4), (4, 4), (6, 1), (6, 4), (6, 5)))
    frontier = collections.deque([[startState]]) # store states
    actions = collections.deque([[0]]) # store actions
    exploredSet = set()
    count = 0
    while frontier:
        node = frontier.popleft()
        node_action = actions.popleft()
        if isEndState(node[-1][-1]):
            # print(','.join(node_action[1:]).replace(',',''))
            solution = ','.join(node_action[1:]).replace(',','')
            print(count)
            return solution
            # break
        if node[-1] not in exploredSet:
            exploredSet.add(node[-1])
            for action in legalActions(node[-1][0], node[-1][1]):
                count = count + 1
                newPosPlayer, newPosBox = updateState(node[-1][0], node[-1][1], action)
                if isFailed(newPosBox):
                    continue
                frontier.append(node + [(newPosPlayer, newPosBox)])
                actions.append(node_action + [action[-1]])

def depthFirstSearch():
    """Implement depthFirstSearch approach"""
    beginBox = PosOfBoxes(gameState)
    beginPlayer = PosOfPlayer(gameState)

    startState = (beginPlayer, beginBox)
    frontier = collections.deque([[startState]])
    exploredSet = set()
    actions = [[0]]
    count = 0
    while frontier:
        node = frontier.pop()
        node_action = actions.pop()
        if isEndState(node[-1][-1]):
            # print(','.join(node_action[1:]).replace(',',''))
            solution = ','.join(node_action[1:]).replace(',','')
            print(count)
            return solution
            # break
        if node[-1] not in exploredSet:
            exploredSet.add(node[-1])
            for action in legalActions(node[-1][0], node[-1][1]):
                count = count + 1
                newPosPlayer, newPosBox = updateState(node[-1][0], node[-1][1], action)
                if isFailed(newPosBox):
                    continue
                frontier.append(node + [(newPosPlayer, newPosBox)])
                actions.append(node_action + [action[-1]])

def heuristic(posPlayer, posBox):
    """A heuristic function to calculate the overall distance between the else boxes and the else goals"""
    distance = 0
    completes = set(posGoals) & set(posBox)
    sortposBox = list(set(posBox).difference(completes))
    sortposGoals = list(set(posGoals).difference(completes))
    for i in range(len(sortposBox)):
        distance += (abs(sortposBox[i][0] - sortposGoals[i][0])) + (abs(sortposBox[i][1] - sortposGoals[i][1]))
    return distance

def cost(actions):
    """A cost function"""
    return len([x for x in actions if x.islower()])

def uniformCostSearch():
    """Implement uniformCostSearch approach"""
    beginBox = PosOfBoxes(gameState)
    beginPlayer = PosOfPlayer(gameState)

    startState = (beginPlayer, beginBox)
    frontier = PriorityQueue()
    frontier.push([startState], 0)
    exploredSet = set()
    actions = PriorityQueue()
    actions.push([0], 0)
    count = 0
    while frontier:
        node = frontier.pop()
        node_action = actions.pop()
        if isEndState(node[-1][-1]):
            # print(','.join(node_action[1:]).replace(',',''))
            solution = ','.join(node_action[1:]).replace(',','')
            print(count)
            return solution
            # break
        if node[-1] not in exploredSet:
            exploredSet.add(node[-1])
            Cost = cost(node_action[1:])
            for action in legalActions(node[-1][0], node[-1][1]):
                count = count + 1
                newPosPlayer, newPosBox = updateState(node[-1][0], node[-1][1], action)
                if isFailed(newPosBox):
                    continue
                frontier.push(node + [(newPosPlayer, newPosBox)], Cost)
                actions.push(node_action + [action[-1]], Cost)

def aStarSearch():
    """Implement aStarSearch approach"""
    beginBox = PosOfBoxes(gameState)
    beginPlayer = PosOfPlayer(gameState)

    start_state = (beginPlayer, beginBox)
    frontier = PriorityQueue()
    frontier.push([start_state], heuristic(beginPlayer, beginBox))
    exploredSet = set()
    actions = PriorityQueue()
    actions.push([0], heuristic(beginPlayer, start_state[1]))
    count = 0
    while frontier:
        # count = count+1
        node = frontier.pop()
        node_action = actions.pop()
        if isEndState(node[-1][-1]):
            solution = ','.join(node_action[1:]).replace(',','')
            print(solution)
            print(count)
            return solution
            # break
        if node[-1] not in exploredSet:
            exploredSet.add(node[-1])
            Cost = cost(node_action[1:])
            for action in legalActions(node[-1][0], node[-1][1]):
                newPosPlayer, newPosBox = updateState(node[-1][0], node[-1][1], action)
                if isFailed(newPosBox):
                    continue
                count = count + 1
                Heuristic = heuristic(newPosPlayer, newPosBox)
                frontier.push(node + [(newPosPlayer, newPosBox)], Heuristic + Cost)
                actions.push(node_action + [action[-1]], Heuristic + Cost)

def transferToGameState(layout):
    """Transfer the layout of initial puzzle"""

    layout = [','.join(layout[i]) for i in range(len(layout))]
    layout = [x.split(",") for x in layout]
    maxColsNum = max([len(x) for x in layout])
    for irow in range(len(layout)):
        for icol in range(len(layout[irow])):
            if layout[irow][icol] == ' ': layout[irow][icol] = 0   # free space
            elif layout[irow][icol] == '#': layout[irow][icol] = 1 # wall
            elif layout[irow][icol] == '&': layout[irow][icol] = 2 # player
            elif layout[irow][icol] == 'B': layout[irow][icol] = 3 # box
            elif layout[irow][icol] == '.': layout[irow][icol] = 4 # goal
            elif layout[irow][icol] == 'X': layout[irow][icol] = 5 # box on goal
        colsNum = len(layout[irow])
        if colsNum < maxColsNum:
            layout[irow].extend([1 for _ in range(maxColsNum-colsNum)])
    return np.array(layout)

def solveSokodan(method, layout):
    print('solve')
    time_start = time.time()
    global gameState
    global posWalls
    global posGoals

    gameState = transferToGameState(layout)
    posWalls = PosOfWalls(gameState)
    posGoals = PosOfGoals(gameState)
    solution = ''
    if method == 'astar':
        solution = aStarSearch()
    elif method == 'dfs':
        solution = depthFirstSearch()
    elif method == 'bfs':
        solution = breadthFirstSearch()
    elif method == 'ucs':
        solution = uniformCostSearch()
    else:
        raise ValueError('Invalid method.')
    time_end=time.time()
    time_str = '%.2f seconds.' %(time_end-time_start)
    print(solution)
    print('Runtime of %s: %.2f second.' %(method, time_end-time_start))
    return solution, time_str

solveSokodan
  `)
  document.querySelector('.calc').removeAttribute('disabled')
  document.querySelector('.calc').textContent = 'Solve'
  return solveSokodan
}

const init = async () => {
  console.log('init')
  setupInitialGrid()
  await loadLevelList()
  await loadLevel(DATA.levels[0].name)
  bindClicks()

  DATA.solveSokodan = await initSolver()
}
init()
