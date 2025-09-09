# 🎮 Sokoban Solver & Game

> A modern, responsive web-based Sokoban puzzle game with an intelligent solver, level editor, and solution visualizer. Play classic push-the-box puzzles or let the AI solve them for you!

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Try_Now-blue?style=for-the-badge)](https://dangarfield.github.io/sokoban-solver/)

![Sokoban Solver Preview](https://i.ibb.co/ZSWtVfw/preview.gif)

## ✨ Features

### 🎯 Game & Solver
- **Intelligent AI Solver** - Advanced A* algorithm with optimized performance
- **Real-time Progress** - Watch the solver work with live progress updates
- **Solution Playback** - Step through solutions move by move
- **Multiple Algorithms** - Choose from BFS, DFS, UCS, or A* search methods

### 🎨 Level Editor
- **Visual Editor** - Click cells to cycle through floor, wall, block, target, and player
- **Responsive Grid** - Automatically scales to fit your screen
- **Custom Levels** - Create and save your own puzzles
- **Import/Export** - Share levels via URL with deep-linking support

### 🎮 Gameplay
- **Smooth Controls** - Play with WASD, arrow keys, or on-screen buttons
- **Voice Control** - Use speech recognition for hands-free play
- **Mobile Friendly** - Fully responsive design works on all devices
- **Auto-progression** - Automatically advance to next level when solved

### 💾 Data Management
- **Local Storage** - All progress saved in your browser
- **Level Sharing** - Generate shareable URLs for custom levels
- **Reset Option** - Clear all data and start fresh
- **Cached Solutions** - Previously solved puzzles load instantly

## 🚀 Quick Start

### Online (Recommended)
Simply visit the [live application](https://dangarfield.github.io/sokoban-solver/) - no installation required!

### Local Development
```bash
# Clone the repository
git clone https://github.com/dangarfield/sokoban-solver.git
cd sokoban-solver

# Serve locally (any web server works)
npx serve .
# or
python -m http.server 8000
# or
php -S localhost:8000

# Open http://localhost:8000 in your browser
```

## 🎮 How to Play

### Basic Controls
- **Movement**: `WASD` keys or arrow keys
- **Reset Level**: `Escape` or `Space`
- **Voice Commands**: Say "up", "down", "left", "right", or "restart"

### Level Editor
1. **Click any cell** to cycle through types:
   - Floor (empty space)
   - Wall (obstacle)
   - Block (pushable box)
   - Target (goal position)
   - Player (starting position)
   - Target & Block together
   - Target & Player together

2. **Save your level** using the save button
3. **Share your creation** with the export button

### Using the Solver
1. **Click "Solve"** to start the AI solver
2. **Watch progress** as it explores possible moves
3. **Navigate solution** with Previous/Next buttons
4. **Solutions are cached** for instant replay

## 🧠 Solver Algorithms

The application includes multiple solving algorithms:

- **A* Search** (Default) - Optimal pathfinding with heuristics
- **Breadth-First Search** - Guarantees shortest solution
- **Depth-First Search** - Memory efficient exploration
- **Uniform Cost Search** - Considers move costs

### Performance Optimizations
- **20x faster** than original implementation
- **Non-blocking UI** - Solver runs without freezing the interface
- **Progress feedback** - Real-time updates on solving progress
- **Timeout protection** - Prevents browser "unresponsive script" warnings

## 🎨 Level Format

Levels use a simple text format:
```
Level: My Custom Level
########
#  .   #
# B  & #
#      #
########
```

**Symbols:**
- `#` = Wall
- ` ` = Floor (empty space)
- `B` = Block (box to push)
- `.` = Target (goal position)
- `&` = Player starting position
- `X` = Block on target
- `%` = Player on target

## 🔧 Configuration

### Solver Settings
Edit `main.js` to customize:
```javascript
// Toggle between JavaScript and Python solvers
const USE_JS_SOLVER = true;

// Available algorithms: 'astar', 'bfs', 'dfs', 'ucs'
const DEFAULT_ALGORITHM = 'astar';
```

### Adding Levels
Edit `levels.txt` to include new puzzles:
```
Level: Easy Puzzle
####
#.&#
#B #
####

Level: Medium Challenge
#######
#.  & #
# BB  #
#  .  #
#######
```

## 🤝 Contributing

This project builds upon the excellent work from [KnightofLuna/sokoban-solver](https://github.com/KnightofLuna/sokoban-solver).

### Recent Improvements
- ✅ Responsive grid layout with dynamic sizing
- ✅ Modern UI with Bootstrap styling
- ✅ Optimized JavaScript solver (20x performance boost)
- ✅ Deep-linking and URL sharing
- ✅ Mobile-friendly responsive design
- ✅ Voice control integration
- ✅ Real-time solver progress feedback

