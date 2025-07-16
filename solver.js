// Sokoban Solver - JavaScript Implementation
// Converted from Python solver.py

let gameState = null;
let posWalls = null;
let posGoals = null;

class PriorityQueue {
    constructor() {
        this.heap = [];
        this.count = 0;
    }

    push(item, priority) {
        const entry = [priority, this.count, item];
        this.heapPush(this.heap, entry);
        this.count++;
    }

    pop() {
        const [, , item] = this.heapPop(this.heap);
        return item;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    heapPush(heap, item) {
        heap.push(item);
        this.siftDown(heap, 0, heap.length - 1);
    }

    heapPop(heap) {
        const lastelt = heap.pop();
        if (heap.length > 0) {
            const returnitem = heap[0];
            heap[0] = lastelt;
            this.siftUp(heap, 0);
            return returnitem;
        }
        return lastelt;
    }

    siftUp(heap, pos) {
        const endpos = heap.length;
        const startpos = pos;
        const newitem = heap[pos];
        let childpos = 2 * pos + 1;
        
        while (childpos < endpos) {
            const rightpos = childpos + 1;
            if (rightpos < endpos && !(heap[childpos] < heap[rightpos])) {
                childpos = rightpos;
            }
            heap[pos] = heap[childpos];
            pos = childpos;
            childpos = 2 * pos + 1;
        }
        
        heap[pos] = newitem;
        this.siftDown(heap, startpos, pos);
    }

    siftDown(heap, startpos, pos) {
        const newitem = heap[pos];
        
        while (pos > startpos) {
            const parentpos = (pos - 1) >> 1;
            const parent = heap[parentpos];
            if (newitem < parent) {
                heap[pos] = parent;
                pos = parentpos;
                continue;
            }
            break;
        }
        heap[pos] = newitem;
    }
}

function posOfPlayer(gameState) {
    for (let i = 0; i < gameState.length; i++) {
        for (let j = 0; j < gameState[i].length; j++) {
            if (gameState[i][j] === 2) {
                return [i, j];
            }
        }
    }
    return null;
}

function posOfBoxes(gameState) {
    const boxes = [];
    for (let i = 0; i < gameState.length; i++) {
        for (let j = 0; j < gameState[i].length; j++) {
            if (gameState[i][j] === 3 || gameState[i][j] === 5) {
                boxes.push([i, j]);
            }
        }
    }
    return boxes;
}

function posOfWalls(gameState) {
    const walls = [];
    for (let i = 0; i < gameState.length; i++) {
        for (let j = 0; j < gameState[i].length; j++) {
            if (gameState[i][j] === 1) {
                walls.push([i, j]);
            }
        }
    }
    return walls;
}

function posOfGoals(gameState) {
    const goals = [];
    for (let i = 0; i < gameState.length; i++) {
        for (let j = 0; j < gameState[i].length; j++) {
            if (gameState[i][j] === 4 || gameState[i][j] === 5) {
                goals.push([i, j]);
            }
        }
    }
    return goals;
}

function isEndState(posBox) {
    if (posBox.length !== posGoals.length) return false;
    
    const sortedBox = posBox.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const sortedGoals = posGoals.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    
    for (let i = 0; i < sortedBox.length; i++) {
        if (sortedBox[i][0] !== sortedGoals[i][0] || sortedBox[i][1] !== sortedGoals[i][1]) {
            return false;
        }
    }
    return true;
}

function arrayIncludes(arr, target) {
    return arr.some(item => item[0] === target[0] && item[1] === target[1]);
}

function isLegalAction(action, posPlayer, posBox) {
    const [xPlayer, yPlayer] = posPlayer;
    let x1, y1;
    
    if (action[2] && action[2] === action[2].toUpperCase()) {
        // Push move
        x1 = xPlayer + 2 * action[0];
        y1 = yPlayer + 2 * action[1];
    } else {
        // Regular move
        x1 = xPlayer + action[0];
        y1 = yPlayer + action[1];
    }
    
    const allPositions = [...posBox, ...posWalls];
    return !arrayIncludes(allPositions, [x1, y1]);
}

function legalActions(posPlayer, posBox) {
    const allActions = [
        [-1, 0, 'u', 'U'],
        [1, 0, 'd', 'D'],
        [0, -1, 'l', 'L'],
        [0, 1, 'r', 'R']
    ];
    
    const [xPlayer, yPlayer] = posPlayer;
    const legalActionsList = [];
    
    for (let action of allActions) {
        const x1 = xPlayer + action[0];
        const y1 = yPlayer + action[1];
        
        let finalAction;
        if (arrayIncludes(posBox, [x1, y1])) {
            // Push move
            finalAction = [action[0], action[1], action[3]];
        } else {
            // Regular move
            finalAction = [action[0], action[1], action[2]];
        }
        
        if (isLegalAction(finalAction, posPlayer, posBox)) {
            legalActionsList.push(finalAction);
        }
    }
    
    return legalActionsList;
}

function updateState(posPlayer, posBox, action) {
    const [xPlayer, yPlayer] = posPlayer;
    const newPosPlayer = [xPlayer + action[0], yPlayer + action[1]];
    let newPosBox = posBox.slice();
    
    if (action[2] === action[2].toUpperCase()) {
        // Push move
        const boxIndex = newPosBox.findIndex(box => box[0] === newPosPlayer[0] && box[1] === newPosPlayer[1]);
        if (boxIndex !== -1) {
            newPosBox[boxIndex] = [xPlayer + 2 * action[0], yPlayer + 2 * action[1]];
        }
    }
    
    return [newPosPlayer, newPosBox];
}

function isFailed(posBox) {
    const rotatePattern = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8],
        [2, 5, 8, 1, 4, 7, 0, 3, 6],
        [8, 7, 6, 5, 4, 3, 2, 1, 0],
        [6, 3, 0, 7, 4, 1, 8, 5, 2]
    ];
    
    const flipPattern = [
        [2, 1, 0, 5, 4, 3, 8, 7, 6],
        [0, 3, 6, 1, 4, 7, 2, 5, 8],
        [6, 7, 8, 3, 4, 5, 0, 1, 2],
        [8, 5, 2, 7, 4, 1, 6, 3, 0]
    ];
    
    const allPattern = [...rotatePattern, ...flipPattern];
    
    for (let box of posBox) {
        if (!arrayIncludes(posGoals, box)) {
            const board = [
                [box[0] - 1, box[1] - 1], [box[0] - 1, box[1]], [box[0] - 1, box[1] + 1],
                [box[0], box[1] - 1], [box[0], box[1]], [box[0], box[1] + 1],
                [box[0] + 1, box[1] - 1], [box[0] + 1, box[1]], [box[0] + 1, box[1] + 1]
            ];
            
            for (let pattern of allPattern) {
                const newBoard = pattern.map(i => board[i]);
                
                if (arrayIncludes(posWalls, newBoard[1]) && arrayIncludes(posWalls, newBoard[5])) return true;
                if (arrayIncludes(posBox, newBoard[1]) && arrayIncludes(posWalls, newBoard[2]) && arrayIncludes(posWalls, newBoard[5])) return true;
                if (arrayIncludes(posBox, newBoard[1]) && arrayIncludes(posWalls, newBoard[2]) && arrayIncludes(posBox, newBoard[5])) return true;
                if (arrayIncludes(posBox, newBoard[1]) && arrayIncludes(posBox, newBoard[2]) && arrayIncludes(posBox, newBoard[5])) return true;
                if (arrayIncludes(posBox, newBoard[1]) && arrayIncludes(posBox, newBoard[6]) && 
                    arrayIncludes(posWalls, newBoard[2]) && arrayIncludes(posWalls, newBoard[3]) && arrayIncludes(posWalls, newBoard[8])) return true;
            }
        }
    }
    return false;
}

function breadthFirstSearch() {
    const beginBox = posOfBoxes(gameState);
    const beginPlayer = posOfPlayer(gameState);
    
    const startState = [beginPlayer, beginBox];
    const frontier = [[startState]];
    const actions = [[0]];
    const exploredSet = new Set();
    let count = 0;
    
    while (frontier.length > 0) {
        const node = frontier.shift();
        const nodeAction = actions.shift();
        
        if (isEndState(node[node.length - 1][1])) {
            const solution = nodeAction.slice(1).join('').replace(/,/g, '');
            console.log(count);
            return solution;
        }
        
        const stateKey = JSON.stringify(node[node.length - 1]);
        if (!exploredSet.has(stateKey)) {
            exploredSet.add(stateKey);
            
            for (let action of legalActions(node[node.length - 1][0], node[node.length - 1][1])) {
                count++;
                const [newPosPlayer, newPosBox] = updateState(node[node.length - 1][0], node[node.length - 1][1], action);
                
                if (isFailed(newPosBox)) continue;
                
                frontier.push([...node, [newPosPlayer, newPosBox]]);
                actions.push([...nodeAction, action[2]]);
            }
        }
    }
    return null;
}

function depthFirstSearch() {
    const beginBox = posOfBoxes(gameState);
    const beginPlayer = posOfPlayer(gameState);
    
    const startState = [beginPlayer, beginBox];
    const frontier = [[startState]];
    const exploredSet = new Set();
    const actions = [[0]];
    let count = 0;
    
    while (frontier.length > 0) {
        const node = frontier.pop();
        const nodeAction = actions.pop();
        
        if (isEndState(node[node.length - 1][1])) {
            const solution = nodeAction.slice(1).join('').replace(/,/g, '');
            console.log(count);
            return solution;
        }
        
        const stateKey = JSON.stringify(node[node.length - 1]);
        if (!exploredSet.has(stateKey)) {
            exploredSet.add(stateKey);
            
            for (let action of legalActions(node[node.length - 1][0], node[node.length - 1][1])) {
                count++;
                const [newPosPlayer, newPosBox] = updateState(node[node.length - 1][0], node[node.length - 1][1], action);
                
                if (isFailed(newPosBox)) continue;
                
                frontier.push([...node, [newPosPlayer, newPosBox]]);
                actions.push([...nodeAction, action[2]]);
            }
        }
    }
    return null;
}

function heuristic(posPlayer, posBox) {
    let distance = 0;
    const completes = posBox.filter(box => arrayIncludes(posGoals, box));
    const sortposBox = posBox.filter(box => !arrayIncludes(posGoals, box));
    const sortposGoals = posGoals.filter(goal => !arrayIncludes(completes, goal));
    
    for (let i = 0; i < sortposBox.length; i++) {
        if (i < sortposGoals.length) {
            distance += Math.abs(sortposBox[i][0] - sortposGoals[i][0]) + Math.abs(sortposBox[i][1] - sortposGoals[i][1]);
        }
    }
    return distance;
}

function cost(actions) {
    return actions.filter(x => typeof x === 'string' && x === x.toLowerCase()).length;
}

function uniformCostSearch() {
    const beginBox = posOfBoxes(gameState);
    const beginPlayer = posOfPlayer(gameState);
    
    const startState = [beginPlayer, beginBox];
    const frontier = new PriorityQueue();
    frontier.push([startState], 0);
    const exploredSet = new Set();
    const actions = new PriorityQueue();
    actions.push([0], 0);
    let count = 0;
    
    while (!frontier.isEmpty()) {
        const node = frontier.pop();
        const nodeAction = actions.pop();
        
        if (isEndState(node[node.length - 1][1])) {
            const solution = nodeAction.slice(1).join('').replace(/,/g, '');
            console.log(count);
            return solution;
        }
        
        const stateKey = JSON.stringify(node[node.length - 1]);
        if (!exploredSet.has(stateKey)) {
            exploredSet.add(stateKey);
            const Cost = cost(nodeAction.slice(1));
            
            for (let action of legalActions(node[node.length - 1][0], node[node.length - 1][1])) {
                count++;
                const [newPosPlayer, newPosBox] = updateState(node[node.length - 1][0], node[node.length - 1][1], action);
                
                if (isFailed(newPosBox)) continue;
                
                frontier.push([...node, [newPosPlayer, newPosBox]], Cost);
                actions.push([...nodeAction, action[2]], Cost);
            }
        }
    }
    return null;
}

function aStarSearch() {
    const beginBox = posOfBoxes(gameState);
    const beginPlayer = posOfPlayer(gameState);
    
    const startState = [beginPlayer, beginBox];
    const frontier = new PriorityQueue();
    frontier.push([startState], heuristic(beginPlayer, beginBox));
    const exploredSet = new Set();
    const actions = new PriorityQueue();
    actions.push([0], heuristic(beginPlayer, startState[1]));
    let count = 0;
    
    while (!frontier.isEmpty()) {
        const node = frontier.pop();
        const nodeAction = actions.pop();
        
        if (isEndState(node[node.length - 1][1])) {
            const solution = nodeAction.slice(1).join('').replace(/,/g, '');
            console.log(solution);
            console.log(count);
            return solution;
        }
        
        const stateKey = JSON.stringify(node[node.length - 1]);
        if (!exploredSet.has(stateKey)) {
            exploredSet.add(stateKey);
            const Cost = cost(nodeAction.slice(1));
            
            for (let action of legalActions(node[node.length - 1][0], node[node.length - 1][1])) {
                const [newPosPlayer, newPosBox] = updateState(node[node.length - 1][0], node[node.length - 1][1], action);
                
                if (isFailed(newPosBox)) continue;
                
                count++;
                const Heuristic = heuristic(newPosPlayer, newPosBox);
                frontier.push([...node, [newPosPlayer, newPosBox]], Heuristic + Cost);
                actions.push([...nodeAction, action[2]], Heuristic + Cost);
            }
        }
    }
    return 'x';
}

function transferToGameState(layout) {
    const maxColsNum = Math.max(...layout.map(row => row.length));
    
    const gameStateArray = layout.map(row => {
        const processedRow = row.split('').map(cell => {
            switch (cell) {
                case ' ': return 0; // free space
                case '#': return 1; // wall
                case '&': return 2; // player
                case 'B': return 3; // box
                case '.': return 4; // goal
                case 'X': return 5; // box on goal
                case '%': return 2; // player on goal (treat as player)
                default: return 0;
            }
        });
        
        // Pad with walls if row is shorter than max
        while (processedRow.length < maxColsNum) {
            processedRow.push(1);
        }
        
        return processedRow;
    });
    
    return gameStateArray;
}

function solveSokoban(method, layout) {
    console.log('solve');
    const timeStart = performance.now();
    
    gameState = transferToGameState(layout);
    posWalls = posOfWalls(gameState);
    posGoals = posOfGoals(gameState);
    
    let solution = '';
    
    switch (method) {
        case 'astar':
            solution = aStarSearch();
            break;
        case 'dfs':
            solution = depthFirstSearch();
            break;
        case 'bfs':
            solution = breadthFirstSearch();
            break;
        case 'ucs':
            solution = uniformCostSearch();
            break;
        default:
            throw new Error('Invalid method.');
    }
    
    const timeEnd = performance.now();
    const timeStr = ((timeEnd - timeStart) / 1000).toFixed(2) + ' seconds.';
    
    console.log(solution);
    console.log(`Runtime of ${method}: ${timeStr}`);
    
    return [solution, timeStr];
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { solveSokoban };
} else if (typeof window !== 'undefined') {
    window.solveSokoban = solveSokoban;
}
