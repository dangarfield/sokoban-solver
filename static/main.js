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
    const levelName = window.prompt('Level name', document.querySelector('.load-select').value)
    if (levelName != null) {
      const text = gridToText().join('')
      console.log('save', levelName, text)
      const req = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: levelName, grid: text})
      })
      const res = await req.json()
      console.log('res', res)
      await loadLevelList()
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
      const currentLevelIndex = DATA.levels.indexOf(DATA.current)
      console.log('currentLevelIndex', currentLevelIndex)
      if (currentLevelIndex + 1 < DATA.levels.length) {
        loadLevel(DATA.levels[currentLevelIndex + 1])
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
    if (wi + 1 < DATA.w) text += '\n'
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
const calculate = async () => {
  console.log('calculate')
  document.querySelector('.calc').setAttribute('disabled', 'disabled')
  const gridText = gridToText()
  const reqBody = {method: 'astar', grid: gridText, level: DATA.current}
  const req = await fetch('/api/solve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reqBody)
  })
  const res = await req.json()
  console.log('res', res)
  DATA.solution.directions = res.solution
  populateSolutionStates()
  //   document.querySelector('.next').removeAttribute('disabled')
  //   document.querySelector('.prev').removeAttribute('disabled')
  document.querySelector('.calc').removeAttribute('disabled')
}
const loadLevelList = async () => {
  const req = await fetch('/api/levels')
  DATA.levels = (await req.json()).levels
  console.log(DATA.levels)
  const loadSelect = document.querySelector('.load-select')
  loadSelect.innerHTML = ''
  DATA.levels.forEach(levelName => {
    const option = document.createElement('option')
    option.setAttribute('value', levelName)
    option.innerText = levelName
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
  const req = await fetch(`/api/levels/${levelName}`)
  const res = await req.json()
  console.log('loadLevel res', res)
  DATA.current = levelName
  DATA.h = res.grid.length
  //   console.log('DATA.h', DATA.h)
  DATA.w = Math.max(...res.grid.map(row => row.replace('\n', '').split('').length))
  //   console.log('DATA.w', DATA.w)
  setupInitialGrid()
  for (let wi = 0; wi < res.grid.length; wi++) {
    const row = res.grid[wi].replace('\n', '').split('')
    for (let hi = 0; hi < row.length; hi++) {
      const cellValue = row[hi]
      const dataType = convertToDataType(cellValue)
      //   console.log(wi, hi, cellValue, dataType)
      document.querySelector(`.cell-${wi}-${hi}`).setAttribute('data-type', dataType)
    }
  }
  document.querySelector('.load-select').value = levelName
}
const init = async () => {
  console.log('init')
  setupInitialGrid()
  await loadLevelList()
  await loadLevel(DATA.levels[0])
  bindClicks()
}
init()
