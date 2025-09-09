// Sokoban Solver - JavaScript Implementation (Optimized)
// Converted from Python solver.py

let gameState = null;
let posWalls = null;
let posGoals = null;
let gameWidth = 0;
let gameHeight = 0;

// Fast state key generation using bit manipulation
function createStateKey(playerPos, boxPositions) {
    // Use a more efficient key generation
    const playerKey = playerPos[0] * 1000 + playerPos[1];
    const boxKey = boxPositions
        .map(box => box[0] * 1000 + box[1])
        .sort((a, b) => a - b)
        .join(',');
    return `${playerKey}:${boxKey}`;
}

// Optimized position sets using Maps for O(1) lookup
const wallSet = new Map();
const goalSet = new Map();

function posToKey(pos) {
    return pos[0] * 1000 + pos[1];
}

function isWall(pos) {
    return wallSet.has(posToKey(pos));
}

function isGoal(pos) {
    return goalSet.has(posToKey(pos));
}

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
    wallSet.clear();
    for (let i = 0; i < gameState.length; i++) {
        for (let j = 0; j < gameState[i].length; j++) {
            if (gameState[i][j] === 1) {
                const pos = [i, j];
                walls.push(pos);
                wallSet.set(posToKey(pos), true);
            }
        }
    }
    return walls;
}

function posOfGoals(gameState) {
    const goals = [];
    goalSet.clear();
    for (let i = 0; i < gameState.length; i++) {
        for (let j = 0; j < gameState[i].length; j++) {
            if (gameState[i][j] === 4 || gameState[i][j] === 5) {
                const pos = [i, j];
                goals.push(pos);
                goalSet.set(posToKey(pos), true);
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

// Optimized position checking using Sets
function arrayIncludes(arr, target) {
    const targetKey = posToKey(target);
    return arr.some(item => posToKey(item) === targetKey);
}

// Even faster version using pre-computed sets
function createPositionSet(positions) {
    const set = new Set();
    positions.forEach(pos => set.add(posToKey(pos)));
    return set;
}

function positionSetHas(set, pos) {
    return set.has(posToKey(pos));
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
    
    const targetPos = [x1, y1];
    
    // Check bounds first (fastest check)
    if (x1 < 0 || x1 >= gameHeight || y1 < 0 || y1 >= gameWidth) {
        return false;
    }
    
    // Check walls using fast lookup
    if (isWall(targetPos)) {
        return false;
    }
    
    // Check boxes using optimized lookup
    return !arrayIncludes(posBox, targetPos);
}

// Pre-computed action directions for better performance
const ACTION_DIRECTIONS = [
    [-1, 0, 'u', 'U'],
    [1, 0, 'd', 'D'],
    [0, -1, 'l', 'L'],
    [0, 1, 'r', 'R']
];

function legalActions(posPlayer, posBox) {
    const [xPlayer, yPlayer] = posPlayer;
    const legalActionsList = [];
    const boxSet = createPositionSet(posBox);
    
    for (let i = 0; i < ACTION_DIRECTIONS.length; i++) {
        const action = ACTION_DIRECTIONS[i];
        const x1 = xPlayer + action[0];
        const y1 = yPlayer + action[1];
        const nextPos = [x1, y1];
        
        let finalAction;
        if (positionSetHas(boxSet, nextPos)) {
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
    
    if (action[2] === action[2].toUpperCase()) {
        // Push move - create new box array with updated position
        const newPosBox = new Array(posBox.length);
        const newPlayerKey = posToKey(newPosPlayer);
        let boxMoved = false;
        
        for (let i = 0; i < posBox.length; i++) {
            if (!boxMoved && posToKey(posBox[i]) === newPlayerKey) {
                // Move this box
                newPosBox[i] = [xPlayer + 2 * action[0], yPlayer + 2 * action[1]];
                boxMoved = true;
            } else {
                newPosBox[i] = posBox[i];
            }
        }
        
        return [newPosPlayer, newPosBox];
    } else {
        // Regular move - no box changes
        return [newPosPlayer, posBox];
    }
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

// Optimized heuristic with better performance
function heuristic(posPlayer, posBox) {
    let distance = 0;
    const goalSet = createPositionSet(posGoals);
    const unplacedBoxes = [];
    const unfilledGoals = [...posGoals];
    
    // Separate placed and unplaced boxes
    for (let i = 0; i < posBox.length; i++) {
        const box = posBox[i];
        if (positionSetHas(goalSet, box)) {
            // Box is on a goal, remove this goal from unfilled list
            const goalIndex = unfilledGoals.findIndex(goal => 
                goal[0] === box[0] && goal[1] === box[1]
            );
            if (goalIndex !== -1) {
                unfilledGoals.splice(goalIndex, 1);
            }
        } else {
            unplacedBoxes.push(box);
        }
    }
    
    // Calculate Manhattan distance for unplaced boxes to nearest goals
    for (let i = 0; i < unplacedBoxes.length && i < unfilledGoals.length; i++) {
        const box = unplacedBoxes[i];
        const goal = unfilledGoals[i];
        distance += Math.abs(box[0] - goal[0]) + Math.abs(box[1] - goal[1]);
    }
    
    return distance;
}

// Optimized cost function
function cost(actions) {
    if (typeof actions === 'string') {
        // Count lowercase characters (moves) in string
        let count = 0;
        for (let i = 0; i < actions.length; i++) {
            const char = actions[i];
            if (char >= 'a' && char <= 'z') {
                count++;
            }
        }
        return count;
    }
    
    // Fallback for array input
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

async function aStarSearch(progressCallback = null, timeoutMs = 30000) {
    const beginBox = posOfBoxes(gameState);
    const beginPlayer = posOfPlayer(gameState);
    
    // Use more efficient state representation
    const frontier = new PriorityQueue();
    const exploredSet = new Set();
    
    // Initial state
    const initialState = { player: beginPlayer, boxes: beginBox, path: '' };
    const initialHeuristic = heuristic(beginPlayer, beginBox);
    
    frontier.push(initialState, initialHeuristic);
    
    let count = 0;
    let lastYieldTime = performance.now();
    const startTime = performance.now();
    
    while (!frontier.isEmpty()) {
        // Check for timeout
        const currentTime = performance.now();
        if (currentTime - startTime > timeoutMs) {
            throw new Error('Solver timeout - puzzle may be too complex');
        }
        
        // Yield control to UI periodically (less frequently for better performance)
        if (currentTime - lastYieldTime > 200) { // Yield every 100ms instead of 50ms
            if (progressCallback) {
                progressCallback({
                    explored: exploredSet.size,
                    frontier: frontier.heap.length,
                    iterations: count,
                    timeElapsed: Math.round((currentTime - startTime) / 1000)
                });
            }
            await new Promise(resolve => setTimeout(resolve, 0));
            lastYieldTime = performance.now();
        }
        
        const currentState = frontier.pop();
        
        // Check if we've reached the goal
        if (isEndState(currentState.boxes)) {
            console.log(currentState.path);
            console.log(count);
            return currentState.path;
        }
        
        // Use optimized state key generation
        const stateKey = createStateKey(currentState.player, currentState.boxes);
        if (!exploredSet.has(stateKey)) {
            exploredSet.add(stateKey);
            
            const currentCost = cost(currentState.path.split(''));
            const legalActionsList = legalActions(currentState.player, currentState.boxes);
            
            for (let i = 0; i < legalActionsList.length; i++) {
                const action = legalActionsList[i];
                const [newPosPlayer, newPosBox] = updateState(currentState.player, currentState.boxes, action);
                
                if (isFailed(newPosBox)) continue;
                
                count++;
                const newState = {
                    player: newPosPlayer,
                    boxes: newPosBox,
                    path: currentState.path + action[2]
                };
                
                const heuristicValue = heuristic(newPosPlayer, newPosBox);
                const totalCost = currentCost + heuristicValue + 1;
                
                frontier.push(newState, totalCost);
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

async function solveSokoban(method, layout, progressCallback = null, timeoutMs = 30000) {
    console.log('solve');
    const timeStart = performance.now();
    
    gameState = transferToGameState(layout);
    gameHeight = gameState.length;
    gameWidth = gameState[0] ? gameState[0].length : 0;
    
    posWalls = posOfWalls(gameState);
    posGoals = posOfGoals(gameState);
    
    let solution = '';
    
    try {
        switch (method) {
            case 'astar':
                solution = await aStarSearch(progressCallback, timeoutMs);
                break;
            case 'dfs':
                solution = depthFirstSearch(); // Keep sync for now
                break;
            case 'bfs':
                solution = breadthFirstSearch(); // Keep sync for now
                break;
            case 'ucs':
                solution = uniformCostSearch(); // Keep sync for now
                break;
            default:
                throw new Error('Invalid method.');
        }
    } catch (error) {
        console.error('Solver error:', error);
        throw error;
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
