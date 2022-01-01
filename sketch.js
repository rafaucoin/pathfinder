let cols, rows;
let scl = 40;
let grid = [];
let current;
let stack = [];
let speed = 10;
let speedSlider;
let end, start;
let rowcount, colcount, scalar, startbutton;
let auto;
let openSet = [];
let closedSet = [];
let path = [];
let ready = false;
let pathfound;
let red, blue;
let count = 0;
let astar = false;
let walkercount = 0;
let s, e;
let display;
function setup() {
  let cx = createCanvas(600, 600);
  cx.parent("canvas-content");
  controls();
  restart();
}

function draw() {
  background(51);
  for (let cell of grid) {
    cell.show();
  }

  //automatically generate the maze
  if (auto.checked()) {
    if (!finished())
      generateMaze();
  }
  //animate maze generation
  else {
    while (!finished()) {
      generateMaze();
    }
  }
  
  //is the maze done generating
  if (finished()) {
    startbutton.show();
    if (astar) {
      startbutton.hide();
      //only 'readyastar()' once
      if (!ready) {
        readyastar();
        ready = true;
      }
      while (!pathfound)
        pathfinder();
    }
    current = start;
  }

  if (s >= path.length) {
    showpath();
  }
  //draw the nodes if in graph mode
  let val = display.value();
  if (val == 'Graph') {
    for (let cell of grid) {
      cell.node();
    }
  }
  walker();
  if (finished()) {
    endMarker();
  }

  if (pathfound) {
    if (s < path.length) {
      pathwalker();
    }
  }
}

function restart() {
  count = 0;
  walkercount = 0;
  s = 1;
  e = 2;
  cols = int(colcount.value());
  rows = int(rowcount.value());
  scl = int(scalar.value());
  resizeCanvas(cols * scl, rows * scl);
  red = color(255, 0, 0);
  blue = color(0, 191, 255);
  ready = false;
  pathfound = false;
  astar = false;
  grid = [];
  stack = [];
  closedSet = [];
  openSet = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let c = new cell(i * scl, j * scl, i, j, scl);
      grid.push(c);
    }
  }
  current = random(grid);
  start = current;
  end = random(grid);
  startbutton.hide();
}

function controls() {
  let newline;
  newline = createDiv("Rows");
  newline.parent("main-content");

  rowcount = createInput('30', 'number');
  rowcount.parent("main-content");

  newline = createDiv("Columns");
  newline.parent("main-content");

  colcount = createInput('30', 'number');
  colcount.parent("main-content");

  newline = createDiv("Scale");
  newline.parent("main-content");

  scalar = createInput('10', 'number');
  scalar.parent("main-content");

  newline = createDiv("<br/>");
  newline.parent("main-content");

  restartButton = createButton("restart");
  restartButton.mousePressed(restart);
  restartButton.parent("main-content");

  newline = createDiv("<br/> Maze generation animation Speed");
  newline.parent("main-content");

  speedSlider = createSlider(1, 10, 1);
  speedSlider.parent("main-content");

  newline = createDiv("<br/>");
  newline.parent("main-content");

  display = createRadio();
  display.option('Show Maze', 'Maze').checked = true;
  display.option('Show Graph', 'Graph');
  display.parent("main-content")
  display.style('width', '110px');

  newline = createDiv("<br/>");
  newline.parent("main-content");

  auto = createCheckbox('animate Maze generation', false);
  auto.parent("main-content");
  auto.changed(restart);

  newline = createDiv("<br/>");
  newline.parent("main-content");

  startbutton = createButton("complete Maze");
  startbutton.parent("main-content");
  startbutton.mousePressed(() => {
    astar = true;
  });
  startbutton.hide();
}

function heuristic(a, b) {
  // let d = dist(a.i, a.j, b.i, b.j);
  let d = abs(a.i - b.i) + abs(a.j - b.j);
  return d;
}

function removeFromArray(arr, elt) {
  arr.splice(arr.indexOf(elt), 1);
}

function readyastar() {
  for (let cell of grid) {
    cell.addNeighbors();
  }
  openSet.push(start);
}

function pathfinder() {
  let currentCell;
  if (openSet.length > 0) {

    // Best next option
    let winner = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }
    currentCell = openSet[winner];

    // Did I finish?
    if (pathfound) {
      return;
    }
    if (currentCell === end) {
      pathfound = true;
    }

    // Best option moves from openSet to closedSet
    removeFromArray(openSet, currentCell);
    closedSet.push(currentCell);

    // Check all the neighbors
    let neighbors = currentCell.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];

      // Valid next spot?
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        let tempG = currentCell.g + heuristic(neighbor, currentCell);

        // Is this a better path than before?
        let newPath = false;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } else {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }

        // Yes, it's a better path
        if (newPath) {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = currentCell;
        }
      }

    }
    // Uh oh, no solution
  } else {
    console.log('no solution');
    return;
  }

  // Find the path by working backwards
  path = [];
  let temp = currentCell;
  path.push(temp);
  while (temp.previous) {
    path.push(temp.previous);
    temp = temp.previous;
  }
}

//blue circle that follows path generated by astar algorithm
function pathwalker() {
  fill(blue);
  stroke(blue);
  let l = path.length;
  let current = path[l - s];
  let next = path[l - e];
  if (current && next) {
    let currentpos = createVector(current.i * scl + scl / 2, current.j * scl + scl / 2);
    let nextpos = createVector(next.i * scl + scl / 2, next.j * scl + scl / 2);
    let p = map(walkercount, 0, 200, 0, 1);
    let pos = p5.Vector.lerp(currentpos, nextpos, p);
    circle(pos.x, pos.y, scl / 2);
    if (walkercount >= 200) {
      walkercount = 0;
      s++;
      e++;
    }
    let speed = sqrt(20 * (int(rows) + int(cols)));
    walkercount += (speed * 1.5);
  }
}

//show the path that the astar algorithm generated after the walker has followed it
function showpath() {
  noFill();
  strokeWeight(scl / 4);
  count += 0.25;
  beginShape();
  for (let i = 0; i < min(path.length, count); i++) {
    let p = map(i, 0, path.length, 0, 1);
    stroke(blue);
    vertex(path[i].i * scl + scl / 2, path[i].j * scl + scl / 2);
  }
  endShape();
}

function generateMaze() {
  for (let i = 0; i < speedSlider.value(); i++) {
    current.visited = true;
    let next = current.checkNeighbors();
    if (next !== undefined) {
      
      stack.push(current);
      
      removeWalls(current, next);
      
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();
    }
  }
}

function finished() {
  for (let cell of grid) {
    if (!cell.visited) {
      return false
    }
  }
  return true;
}



function removeWalls(a, b) {
  var x = a.i - b.i;
  if (x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (x === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }
  var y = a.j - b.j;
  if (y === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}