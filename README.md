# Sokoban Game Solver & Solution Previewer

> This is a web wrapper, playable sokoban game, editor and visualiser for sokoban solving.

![Sokoban Solver](https://i.ibb.co/ZSWtVfw/preview.gif)

I wanted to help my 4 year get through some of the games on his little camera and I couldn't, so I adapted this and added an additional presentation format.

All of the hard work relates to https://github.com/KnightofLuna/sokoban-solver.

### Installation

- Standard python / venv
- Run main.py

### Usage

- You can edit levels in `sokobanLevels`
- Alternately run in the browser and save each level, they will also appear in `sokobanLevels`
- Click any cell to cycle between floor, wall, block, target and player. There are interim states (target-block, target-player) that are ommtted fr the sake of simplicity in setting. You can always edit the level files (`space` = floor, `#` = wall, `B` = block, `.` = target, `&` = player, `X` = block on target, `%` = player on target)
- Play the game with `WASD` or `ArrowKeys`, press `Escape` of `space` to restart from the saved map
- Click `Solve` to solve the game and interate through the solution with `Prev` and `Next` buttons - Solutions are cached, but some solves take a long time
- Select a game from the dropdown, that automatically populates from the `sokobanLevels` folder

### Algorithms

- See KnightOfLuna's explanation here - https://github.com/KnightofLuna/sokoban-solver
- Summary - Graph is solved through one of 4 methods, `Breadth First Search`, `Depth First Search`, `Uniform Cost Search` and `A* Search`. The default method for solving is `A* Search`, configurable in `main.js`
