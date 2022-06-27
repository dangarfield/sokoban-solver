import uvicorn
from typing import Any, Dict
from os import listdir
from os.path import isfile, join, exists
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from sokoban import solveFromRequest
import json

api_app = FastAPI(title="api app")

@api_app.post("/solve")
def solve(request: Dict[Any, Any]):
    solutionPath= 'solutions/'+request['level']+'.json'
    if exists(solutionPath):
        with open(solutionPath) as json_file:
            return json.load(json_file)
    else:
        solution, time_str = solveFromRequest(request['method'], request['grid'])
        with open(solutionPath, 'w') as outfile:
            outfile.write(json.dumps({"method": request['method'], "grid": request['grid'], "solution": solution, "time": time_str}))
        return {"method": request['method'], "grid": request['grid'], "solution": solution, "time": time_str}

@api_app.post("/save")
def save(request: Dict[Any, Any]):
    with open('sokobanLevels/'+request['name']+'.txt', 'w') as f:
        f.write(request['grid'])

@api_app.get("/levels")
def levels():
    levelDir = 'sokobanLevels'
    levels = [f for f in listdir(levelDir) if isfile(join(levelDir, f))]
    levels = list(map(lambda x: x.replace('.txt', ''), levels))
    levels.sort()
    return {"levels": levels}

@api_app.get("/levels/{level}")
def level(level: str):
    levelDir = 'sokobanLevels'
    with open(levelDir + '/'+level+'.txt',"r") as f:
        grid = f.readlines()
    return {"level":level, "grid": grid}

app = FastAPI(title="main app")

app.mount("/api", api_app)
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
