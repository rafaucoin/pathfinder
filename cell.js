class cell {

  constructor(x, y, i, j, s) {
    this.pos = createVector(x, y);
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.previous = undefined;
    this.size = s;
    this.walls = [true, true, true, true];
    this.visited = false;
    this.neighbors = [];
  }

  show(col) {

    let val = display.value();
    stroke(0);
    strokeWeight(1);
    //draw the edges of the cells that make up the maze in draw maze mode
    if (val == 'Maze') {
      stroke(0);
      strokeWeight(1);
      if (!col) {
        this.top = this.walls[0];
        this.left = this.walls[3];
        this.right = this.walls[1];
        this.bottom = this.walls[2];
        let pos = this.pos;
        let size = this.size;
        if (this.top)
          line(pos.x, pos.y, pos.x + size, pos.y);
        if (this.left)
          line(pos.x, pos.y, pos.x, pos.y + size);
        if (this.bottom)
          line(pos.x, pos.y + size, pos.x + size, pos.y + size);
        if (this.right)
          line(pos.x + size, pos.y, pos.x + size, pos.y + size);

        if (!this.visited) {
          fill('#7f00ff5a');
          noStroke();
          rect(this.pos.x, this.pos.y, this.size, this.size);
        }
      } else {
        fill(col);
        noStroke();
        rect(this.pos.x, this.pos.y, this.size, this.size);
      }
    }
    //draw the edges of the graph in draw graph mode
    else {

      let r = this.size / 2;

      fill(255);
      stroke(255, 0, 0);
      strokeWeight(2);
      for (let n of this.addNeighbors()) {
        line(this.pos.x + r, this.pos.y + r, n.pos.x + r, n.pos.y + r);
      }
    }
  }
  
  //draw the node of the graph when in draw graph mode
  node() {
      let r = this.size / 2;
      if (!this.visited) {
          fill('#7f00ff5a');
      }else
      {
       fill(255); 
      }
          
      noStroke();
      circle(this.pos.x + r, this.pos.y + r, r / 1.25);
  }
  
  //neighbor function used in astar
  addNeighbors() {

    this.neighbors = [];
    let i = this.i;
    let j = this.j;
    let top = grid[index(i, j - 1)];
    let right = grid[index(i + 1, j)];
    let bottom = grid[index(i, j + 1)];
    let left = grid[index(i - 1, j)];
    this.top = this.walls[0];
    this.right = this.walls[1];
    this.bottom = this.walls[2];
    this.left = this.walls[3];

    if (!this.top && top) {
      this.neighbors.push(top);
    }

    if (!this.right && right) {
      this.neighbors.push(right);
    }

    if (!this.bottom && bottom) {
      this.neighbors.push(bottom);
    }

    if (!this.left && left) {
      this.neighbors.push(left);
    }

    return this.neighbors
  }

  //neighbor function used in maze generation
  checkNeighbors() {
    let neighbors = []

    let i = this.i;
    let j = this.j;
    let top = grid[index(i, j - 1)];
    let right = grid[index(i + 1, j)];
    let bottom = grid[index(i, j + 1)];
    let left = grid[index(i - 1, j)];

    if (top && !top.visited) {
      neighbors.push(top);
    }
    if (right && !right.visited) {
      neighbors.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbors.push(bottom);
    }
    if (left && !left.visited) {
      neighbors.push(left);
    }

    if (neighbors.length > 0) {
      return random(neighbors);
    } else {
      return undefined;
    }
  }
}

//walker that follows the generation of the maze
function walker() {
  fill(color(0, 255, 0));
  noStroke();
  circle(current.pos.x + current.size / 2, current.pos.y + current.size / 2, current.size / 2);
}

//marks the end of the maze that the astar algorithm is trying to get to
function endMarker() {
  fill(red);
  noStroke();
  circle(end.pos.x + end.size / 2, end.pos.y + end.size / 2, end.size / 2);
}

//2d index into 1d array
function index(i, j) {
  if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
    return -1;
  }
  return i + j * cols;
}