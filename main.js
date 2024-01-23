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
    row.classList.add('row', 'gx-0', `row-${wi}`)
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

  document.querySelector('.up').addEventListener('click', function (event) { executeManualMove('u') })
  document.querySelector('.down').addEventListener('click', function (event) { executeManualMove('d') })
  document.querySelector('.left').addEventListener('click', function (event) { executeManualMove('l') })
  document.querySelector('.right').addEventListener('click', function (event) { executeManualMove('r') })

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

  try {
    // Speech
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
    console.log('SpeechRecognition', SpeechRecognition)
    // const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent

    const directions = ['up', 'down', 'left', 'right', 'restart', 'start again']
    const grammar = '#JSGF V1.0; grammar direction; public <direction> = ' + directions.join(' | ') + ' ;'

    const recognition = new SpeechRecognition()
    const speechRecognitionList = new SpeechGrammarList()
    speechRecognitionList.addFromString(grammar, 1)

    recognition.grammars = speechRecognitionList
    recognition.continuous = true
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 0

    recognition.start()

    console.log('recognition.start()')
    recognition.onresult = function (event) {
      // TODO - This is too slow to wait for the 'onresult' event
      console.log('recognition.onresult', event)
      const lastResult = event.results[event.results.length - 1]
      const direction = lastResult[lastResult.length - 1].transcript
      const isFinal = lastResult.isFinal
      // diagnostic.textContent = 'Result received: ' + color + '.'
      // bg.style.backgroundColor = color
      console.log('Confidence: ' + event.results[0][0].confidence, direction, isFinal)

      if (direction.includes('left')) {
        executeManualMove('l')
      } else if (direction.includes('right')) {
        executeManualMove('r')
      } else if (direction.includes('up')) {
        executeManualMove('u')
      } else if (direction.includes('down')) {
        executeManualMove('d')
      } else if (direction.includes('start')) {
        loadLevel(DATA.current)
      }
    }
  } catch (error) {
    console.log('speechRecognition error', error)
  }
}
const save = async () => {
  const text = gridToText()
  console.log('save', DATA.current, text)
  const savedLevels = JSON.parse(window.localStorage.getItem('sok'))

  const level = savedLevels.find(l => l.name === DATA.current)
  console.log('level', level)
  if (level === undefined) {
    const newLevel = { name: DATA.current, grid: text, solution: '' }
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
        return { y: wi, x: hi }
      }
    }
  }
}
const getTargetPos = (x, y, direction) => {
  if (direction.toLowerCase() === 'u') {
    return { player: { x, y: y - 1 }, box: { x, y: y - 2 } }
  } else if (direction.toLowerCase() === 'd') {
    return { player: { x, y: y + 1 }, box: { x, y: y + 2 } }
  } else if (direction.toLowerCase() === 'l') {
    return { player: { x: x - 1, y }, box: { x: x - 2, y } }
  } else if (direction.toLowerCase() === 'r') {
    return { player: { x: x + 1, y }, box: { x: x + 2, y } }
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
  const textList = []
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
      savedLevels.push({ name: DATA.current, grid: gridText, solution })
    } else {
      savedLevel.solution = solution
    }
    window.localStorage.setItem('sok', JSON.stringify(savedLevels))
    level.solution = solution
    DATA.solution.directions = solution
  }

  populateSolutionStates()
  document.querySelector('.calc').removeAttribute('disabled')
  document.querySelector('.calc').classList.add('d-none')
  document.querySelector('.prev').classList.remove('d-none')
  document.querySelector('.next').classList.remove('d-none')
}
const loadLevelList = async () => {
  const req = await fetch('levels.txt')
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
    return { name, solution, grid }
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
  document.querySelector('.calc').classList.remove('d-none')
}
const initSolver = async () => {
  const pyodide = await window.loadPyodide()
  await pyodide.loadPackage(['numpy'])

  const solverCodeText = await (await fetch('solver.py')).text()

  // console.log('solverCodeText', solverCodeText)
  const solveSokodan = pyodide.runPython(solverCodeText)
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
