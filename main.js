var TetrisShape = function(shape) {
  this.rotations = shape.rotations;
  this.rotationState = 0;
  this.data = this.rotations[this.rotationState].data;
  this.x = shape.x;
  this.y = 0;
  this.height = this.rotations[this.rotationState].height;
  this.width = this.rotations[this.rotationState].width;
  this.color = shape.color;
};

TetrisShape.prototype = {
  rotr: function() {
    this.rotationState++;
    this.rotationState %= this.rotations.length;
    this.data = this.rotations[this.rotationState].data;
    this.height = this.rotations[this.rotationState].height;
    this.width = this.rotations[this.rotationState].width;
  },
  rotl: function() {
    this.rotationState--;
    if (this.rotationState < 0) {
      this.rotationState = this.rotations.length - 1;
    }
    this.data = this.rotations[this.rotationState].data;
    this.height = this.rotations[this.rotationState].height;
    this.width = this.rotations[this.rotationState].width;
  },
  forEach: function(FN, caller) {
    FN = caller ? FN.bind(caller) : FN;
    for (var y = 0; y < this.data.length; y++) {
      for (var x = 0; x < this.data[0].length; x++) {
        FN(this.data[y][x], x, y);
      }
    }
  }
};

var TetrisGrid = function(rows, columns) {
  this.width = columns;
  this.height = rows + 2;
  this.data = Array.apply(null, new Array(rows + 2));
  this.data = this.data.map(function() {
    return Array.apply(null, new Array(columns))
      .map(function() { return 0; });
  });
  this.activeShape = null;
};

TetrisGrid.prototype = {
  dropShape: function(shape) {
    shape.x = ~~(this.width / 2 - shape.width / 2);
    this.renderShape(this.activeShape = new TetrisShape(shape));
    return this.activeShape;
  },
  clearShape: function(shape) {
    shape.forEach(function(e, x, y) {
      if (e === 1 && this.data[y + shape.y]) {
        this.data[y + shape.y][x + shape.x] = 0;
      }
    }, this);
  },
  renderShape: function(shape) {
    shape.forEach(function(e, x, y) {
      if (e === 1 && this.data[y + shape.y]) {
        this.data[y + shape.y][x + shape.x] = 1;
      }
    }, this);
  },
  hasXConflict: function(shape, dx) {
    if (shape.x + shape.width === this.width && dx === 1) {
      return true;
    }
    var y, x;
    if (dx === -1) {
      for (y = 0; y < shape.data.length; y++) {
        for (x = 0; x < shape.data[0].length; x++) {
          if (shape.data[y][x] === 1) {
            if (this.data[y + shape.y][x + shape.x + dx] !== 0) {
              return true;
            }
            break;
          }
        }
      }
    } else {
      for (y = 0; y < shape.data.length; y++) {
        for (x = shape.data[0].length - 1; x !== -1; x--) {
          if (shape.data[y][x] === 1) {
            if (this.data[y + shape.y][x + shape.x + dx] !== 0) {
              return true;
            }
            break;
          }
        }
      }
    }
    return false;
  },
  hasYConflict: function(shape, dy) {
    if (shape.y + shape.height === this.height) {
      return true;
    }
    for (var y = 0; y < shape.data.length; y++) {
      for (var x = 0; x < shape.data[0].length; x++) {
        if (shape.data[y][x] === 1) {
          if (!this.data[y + shape.y + dy] || this.data[y + shape.y + dy][x + shape.x] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  },
  hasRotationConflict: function(shape) {
    if ((shape.x < 0 || shape.x + shape.width > this.width) ||
        (shape.y < 0 || shape.y + shape.height > this.height))
    {
      return true;
    }
    for (var y = 0; y < shape.data.length; y++) {
      for (var x = 0; x < shape.data[0].length; x++) {
        if (shape.data[y][x] === 1) {
          if (!this.data[shape.y + y] || this.data[shape.y + y][shape.x + x] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  },
  rotateShape: function(shape) {
    this.clearShape(shape);
    shape.rotr();
    if (this.hasRotationConflict(shape)) {
      shape.rotl();
      this.renderShape(shape);
      return;
    }
    this.renderShape(shape);
  },
  moveShape: function(shape, dx) {
    if (this.hasXConflict(shape, dx)) {
      return false;
    }
    this.clearShape(shape);
    shape.x += dx;
    this.renderShape(shape);
  },
  nextIteration: function() {
    this.clearShape(this.activeShape);
    if (!this.hasYConflict(this.activeShape, 1)) {
      this.activeShape.y++;
    } else {
      this.renderShape(this.activeShape);
      return true;
    }
    this.renderShape(this.activeShape);
    return false;
  }
};

var TetrisPieces = {
  I: {
    rotations: [
      {
        data: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ],
        width: 4,
        height: 1
      },
      {
        data: [
          [0, 0, 1, 0],
          [0, 0, 1, 0],
          [0, 0, 1, 0],
          [0, 0, 1, 0]
        ],
        width: 1,
        height: 4
      },
      {
        data: [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0]
        ],
        width: 4,
        height: 1
      },
      {
        data: [
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0]
        ],
        width: 1,
        height: 4
      },
    ],
    width: 4,
    height: 4,
    color: '#00f0f0'
  },
  J: {
    rotations: [
      {
        data: [
          [1, 0, 0],
          [1, 1, 1],
          [0, 0, 0]
        ],
        width: 3,
        height: 2
      },
      {
        data: [
          [0, 1, 1],
          [0, 1, 0],
          [0, 1, 0]
        ],
        width: 2,
        height: 3
      },
      {
        data: [
          [0, 0, 0],
          [1, 1, 1],
          [0, 0, 1]
        ],
        width: 3,
        height: 2
      },
      {
        data: [
          [0, 1, 0],
          [0, 1, 0],
          [1, 1, 0]
        ],
        width: 2,
        height: 3
      }
    ],
    width: 3,
    height: 3,
    color: '#0000f0'
  },
  L: {
    rotations: [
      {
        data: [
          [0, 0, 1],
          [1, 1, 1],
          [0, 0, 0]
        ],
        width: 3,
        height: 2
      },
      {
        data: [
          [0, 1, 0],
          [0, 1, 0],
          [0, 1, 1]
        ],
        width: 2,
        height: 3
      },
      {
        data: [
          [0, 0, 0],
          [1, 1, 1],
          [1, 0, 0]
        ],
        width: 3,
        height: 2
      },
      {
        data: [
          [1, 1, 0],
          [0, 1, 0],
          [0, 1, 0]
        ],
        width: 2,
        height: 3
      }
    ],
    width: 3,
    height: 3,
    color: '#f0a000'
  },
  O: {
    rotations: [
      {
        data: [
          [0, 1, 1, 0],
          [0, 1, 1, 0],
          [0, 0, 0, 0]
        ],
        width: 2,
        height: 2
      }
    ],
    width: 4,
    height: 3,
    color: '#f0f000'
  },
  S: {
    rotations: [
      {
        data: [
          [0, 1, 1],
          [1, 1, 0],
          [0, 0, 0]
        ],
        width: 3,
        height: 2
      },
      {
        data: [
          [0, 1, 0],
          [0, 1, 1],
          [0, 0, 1]
        ],
        width: 2,
        height: 3
      },
      {
        data: [
          [0, 0, 0],
          [0, 1, 1],
          [1, 1, 0]
        ],
        width: 3,
        height: 2
      },
      {
        data: [
          [1, 0, 0],
          [1, 1, 0],
          [0, 1, 0]
        ],
        width: 2,
        height: 3
      }
    ],
    width: 3,
    height: 3,
    color: '#00f000'
  },
  T: {
    rotations: [
      {
        data: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 0, 0]
        ],
        width: 3,
        height: 2
      },
      {
        data: [
          [0, 1, 0],
          [0, 1, 1],
          [0, 1, 0]
        ],
        width: 2,
        height: 3
      },
      {
        data: [
          [0, 0, 0],
          [1, 1, 1],
          [0, 1, 0]
        ],
        width: 3,
        height: 2
      },
      {
        data: [
          [0, 1, 0],
          [1, 1, 0],
          [0, 1, 0]
        ],
        width: 2,
        height: 3
      }
    ],
    width: 3,
    height: 3,
    color: '#a000f0'
  },
  Z: {
    rotations: [
      {
        data: [
          [1, 1, 0],
          [0, 1, 1],
          [0, 0, 0]
        ],
        width: 3,
        height: 2
      },
      {
        data: [
          [0, 0, 1],
          [0, 1, 1],
          [0, 1, 0]
        ],
        width: 2,
        height: 3
      },
      {
        data: [
          [0, 0, 0],
          [1, 1, 0],
          [0, 1, 1]
        ],
        width: 3,
        height: 2
      },
      {
        data: [
          [0, 1, 0],
          [1, 1, 0],
          [1, 0, 0]
        ],
        width: 2,
        height: 3
      }
    ],
    width: 3,
    height: 3,
    color: '#f00000'
  },
};

var Tetris = function(canvas, rows, columns, squareSize) {


  var grid = new TetrisGrid(rows, columns);
  var activeShape;

  canvas.width = columns * squareSize;
  canvas.height = rows * squareSize;
  var context = canvas.getContext('2d');

  var bevel = 5;

  var putPixel = function(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);

    context.beginPath();
    context.fillStyle = 'rgba(0,0,0,0.25)';
    context.moveTo(x * squareSize, y * squareSize);
    context.lineTo(x * squareSize + bevel, y * squareSize + bevel);
    context.lineTo(x * squareSize + bevel, (y+1) * squareSize - bevel);
    context.lineTo(x * squareSize, (y+1) * squareSize);
    context.fill();
    context.closePath();

    context.beginPath();
    context.fillStyle = 'rgba(255,255,255,0.55)';
    context.moveTo(x * squareSize, y * squareSize);
    context.lineTo(x * squareSize + bevel, y * squareSize + bevel);
    context.lineTo((x+1) * squareSize - bevel, y * squareSize + bevel);
    context.lineTo((x+1) * squareSize, y * squareSize);
    context.fill();
    context.closePath();

    context.beginPath();
    context.fillStyle = 'rgba(0,0,0,0.35)';
    context.moveTo((x+1) * squareSize, y * squareSize);
    context.lineTo((x+1) * squareSize - bevel, y * squareSize + bevel);
    context.lineTo((x+1) * squareSize - bevel, (y+1) * squareSize - bevel);
    context.lineTo((x+1) * squareSize, (y+1) * squareSize);
    context.fill();
    context.closePath();

    context.beginPath();
    context.fillStyle = 'rgba(0,0,0,0.45)';
    context.moveTo(x * squareSize, (y+1) * squareSize);
    context.lineTo(x * squareSize + bevel, (y+1) * squareSize - bevel);
    context.lineTo((x+1) * squareSize - bevel, (y+1) * squareSize - bevel);
    context.lineTo((x+1) * squareSize, (y+1) * squareSize);
    context.fill();
    context.closePath();
  };

  var clearPixel = function(x, y) {
    context.clearRect(x * squareSize, y * squareSize, squareSize, squareSize);
  };

  var randomShape = function() {
    var keys = Object.keys(TetrisPieces);
    return TetrisPieces[keys[~~(Math.random() * keys.length)]];
  };

  var renderShape = function() {
    activeShape.forEach(function(e, x, y) {
      if (e === 1) {
        putPixel(x + activeShape.x, y + activeShape.y - 2, activeShape.color);
      }
    });
  };

  var clearShape = function() {
    activeShape.forEach(function(e, x, y) {
      if (e === 1) {
        clearPixel(x + activeShape.x, y + activeShape.y - 2, activeShape.color);
      }
    });
  };

  var clearRows = function() {
    for (var y = grid.data.length - 1; y !== -1; y--) {
      if (grid.data[y].every(function(e) { return e; })) {
        grid.data[y] = grid.data[y].map(function() { return 0; });
        grid.data.unshift(grid.data.splice(y, 1)[0]);
        for (var x = 0; x < grid.data[y].length; x++) {
          clearPixel(x, y);
        }
        var image = context.getImageData(0, 0, canvas.width, squareSize * y);
        context.putImageData(image, 0, squareSize);
        return clearRows();
      }
    }
  };

  var Animation = (function() {
    var C = 750;
    var id;
    var left = 0;
    var isAnimating = false;
    var duration = 0;
    var delta;
    var animate = function() {
      if (isAnimating) {
        delta = +Date.now();
        clearShape();
        if (grid.nextIteration()) {
          renderShape();
          clearRows();
          activeShape = grid.dropShape(randomShape());
          duration = 0;
        } else {
          renderShape();
          duration++;
        }
      }
    };
    function pause() {
      isAnimating = false;
      window.clearInterval(id);
      left = C - (+Date.now() - delta);
    }
    function play() {
      window.setTimeout(function() {
        if (!isAnimating) {
          id = window.setInterval(animate, C);
          isAnimating = true;
          animate();
        }
      }, left);
    }
    var reset = function() {
      isAnimating = false;
      window.clearInterval(id);
      id = window.setInterval(animate, C);
      isAnimating = true;
      animate();
      renderShape();
    };
    return {
      animate: function() {
        if (isAnimating) {
          return;
        }
        isAnimating = true;
        id = window.setInterval(animate, C);
      },
      pause: pause,
      play: play,
      reset: reset
    };
  })();

  window.addEventListener('keydown', function(event) {
    switch (event.which) {
      case 37: // Left
        clearShape();
        Animation.pause();
        grid.moveShape(activeShape, -1);
        renderShape();
        Animation.play();
        break;
      case 39: // Right
        clearShape();
        Animation.pause();
        grid.moveShape(activeShape, 1);
        renderShape();
        Animation.play();
        break;
      case 40: // Down
        clearShape();
        Animation.reset();
        break;
      case 38: // Up
        clearShape();
        Animation.pause();
        grid.rotateShape(activeShape);
        renderShape();
        Animation.play();
        break;
    }
  });

  activeShape = grid.dropShape(randomShape());
  Animation.animate();

};

Tetris(document.getElementById('tetris'), 20, 10, 40);