# Sokoban Game Solver & Solution Previewer

> This is a web wrapper, playable sokoban game, editor and visualiser for sokoban solving, using Python through Web Assembly. All client side

> Live application - [https://dangarfield.github.io/sokoban-solver/](https://dangarfield.github.io/sokoban-solver/)

![Sokoban Solver](https://i.ibb.co/ZSWtVfw/preview.gif)

I wanted to help my 4 year get through some of the `push the box` levelss on his little camera and I couldn't, so I adapted this and added an additional presentation format.

All of the hard work relates to https://github.com/KnightofLuna/sokoban-solver.

### Installation

- Not required - All executed in the browser
- Live application - [https://dangarfield.github.io/sokoban-solver/](https://dangarfield.github.io/sokoban-solver/)
- To run locally, simply run a standard web server (eg, NodeJs, `serve .`) on the root directory and open in a browser

### Usage

- You can edit the initial levels in `levels.txt`, adding more levels, solutions are grids as appropriate
- Click any cell to cycle between floor, wall, block, target and player. There are interim states (target-block, target-player) that are ommtted fr the sake of simplicity in setting. You can always edit the level files (`space` = floor, `#` = wall, `B` = block, `.` = target, `&` = player, `X` = block on target, `%` = player on target)
- New grids can be added and existing grids overwritten by saving. All saved grids are stored in your browser's `localStorage`
- Play the game with `WASD` or `ArrowKeys`, press `Escape` of `space` to restart from the saved map
- Click `Solve` to solve the game and interate through the solution with `Prev` and `Next` buttons - Solutions are cached, but some solves take a long timeß

### Algorithms

- See KnightOfLuna's explanation here - https://github.com/KnightofLuna/sokoban-solver
- Summary - Graph is solved through one of 4 methods, `Breadth First Search`, `Depth First Search`, `Uniform Cost Search` and `A* Search`. The default method for solving is `A* Search`, configurable in `main.js`
