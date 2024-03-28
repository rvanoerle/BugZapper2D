var VSHADER_SOURCE = 
  'precision mediump float;\n'+
  'attribute vec3 a_Position;\n'+
  'void main() { \n'+
  'gl_Position = vec4(a_Position, 1.0);\n'+
  '}\n';
  
var FSHADER_SOURCE = 
'precision mediump float;'+
'uniform vec4 a_Color;'+
'void main() {'+
'gl_FragColor = a_Color;'+
'}\n';

function start () {
  var canvas = document.getElementById('webgl');
  const gl = canvas.getContext('webgl');
  
  if (!gl){
    console.log('Failed to get the rendering context for WebGL');
  }

  gl.viewport(0,0,canvas.width,canvas.height);


  if (!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  gl.enable(gl.DEPTH_TEST);

  var vertexbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);

  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  var verticesColor = gl.getUniformLocation(gl.program, "a_Color");
  gl.vertexAttribPointer(a_Position,2, gl.FLOAT, false, 0*Float32Array.BYTES_PER_ELEMENT, 0*Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(a_Position);

  
  function draw(x,y,radius,color) {
    var vertices = [];

    for (var i = 1; i <= 360; i++) {
      vertices.push(x);
      vertices.push(y);
      vertices.push(radius*Math.cos(i)+x);
      vertices.push(radius*Math.sin(i)+y);
      vertices.push(radius*Math.cos(i+1)+x);
      vertices.push(radius*Math.sin(i+1)+y);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.uniform4f(verticesColor, color[0], color[1], color[2],color[3]);
    gl.drawArrays(gl.TRIANGLES, 0, 360*4);
  
  }
  
    
    var numBac = 10; //number of bacteria
    var remain = 10; //number of remaining bacteria
    var created = 0;
    var bacteria = []; //array for bacteria
    var maxCount = 0;
    var p_score = 0; //player score
    var g_score = 0; //game score

    class Bacteria {
      
      getCoords() {
        this.angle = Math.random();
        this.randomOrd = Math.random();
        this.randomYCoord = sign();
        this.randomXCoord = sign();
        if (this.randomOrd < 0.5) {
          this.x = this.randomXCoord * Math.sin(this.angle);
          this.y = this.randomYCoord * Math.cos(this.angle);
        } else {
          this.x = this.randomXCoord * Math.cos(this.angle);
          this.y =this.randomYCoord * Math.sin(this.angle);
        }
      }
      create() {
        this.getCoords();
        this.radius = 0.02;
        this.color = [Math.random(), Math.random(), Math.random(), 1.0]; //randomize color
        this.alive = true;
        created++; //increment number of created bacteria
      }

      poison(id) {
        this.radius = 0;
        this.x = 0;
        this.y = 0;
        this.alive = false;
        remain--;
        bacteria.splice(id,1);
      }
      reload() {
        if(this.alive) {
          if(this.radius > 0.25) { //max threshold
            maxCount ++;
            g_score+=5;
            this.poison(bacteria.indexOf(this));

          } else {
            this.radius += 0.0005; //increase bacteria size
          }
          draw(this.x, this.y, this.radius, this.color);
        }
      }
  
    } 
    function sign(){
      var coord = 0.8;
      if(Math.random() < 0.5){
        coord*=-1;
      }
      return coord;
    }

    canvas.onmousedown = function(e,canvas){click(e, webgl);};

    function click(e, canvas) {
      var x = e.clientX;
      var y = e.clientY;
      
      const rect = e.target.getBoundingClientRect();
      x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
      y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

      for(var i in bacteria) {
        if((Math.pow(bacteria[i].x-x, 2) + Math.pow(bacteria[i].y-y, 2)) - (0 + bacteria[i].radius) < 0){
          p_score += 1;
          bacteria[i].poison(i); //poison clicked bacteria
          break;
         }
      }
    }	

    for(var i = 0; i<numBac; i++){
      bacteria.push(new Bacteria(created));
      bacteria[i].create();
    }

  function main() {
    document.getElementById("game_score").innerHTML= "Game Score: " + g_score;
    document.getElementById("player_score").innerHTML= "Player Score: " + p_score;
    var win;

    for (var i in bacteria) {
        bacteria[i].reload();
        if (maxCount == 2) {
          document.getElementById("win_lose").innerHTML="Game Over";
          win = false;
            break;
        }
        if(p_score >= 9){
          document.getElementById("win_lose").innerHTML="You Win";
          break;
        }
    }
  
    draw(0,0,0.8,[1.0, 1.0, 1.0,1.0]);
    requestAnimationFrame(main);
    }
    requestAnimationFrame(main);
  }
