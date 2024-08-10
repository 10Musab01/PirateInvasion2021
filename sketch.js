const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
var engine, world, backgroundImg,
waterSound,
pirateLaughSound,
backgroundMusic,
cannonExplosion;
var canvas, angle, tower, ground, cannon, boat;
var balls = [];
var boats = [];
var score = 0;
var boatAnimation = [];
var boatSpritedata, boatSpritesheet;
var ballsfired = 0;
var shootingrate = 0.00;
var boatshot = 0;
var playImage,playButton;
var gameState= "serve";
var pauseImage,pauseButton

var brokenBoatAnimation = [];
var brokenBoatSpritedata, brokenBoatSpritesheet;

var waterSplashAnimation = [];
var waterSplashSpritedata, waterSplashSpritesheet;

var isGameWin = false
var isGameOver = false;
var isLaughing= false;

function preload() {
  backgroundImg = loadImage("./assets/background.jpg");
  backgroundMusic = loadSound("./assets/background_music.mp3");
  waterSound = loadSound("./assets/cannon_water.mp3");
  pirateLaughSound = loadSound("./assets/pirate_laugh.mp3");
  cannonExplosion = loadSound("./assets/cannon_explosion.mp3");
  towerImage = loadImage("./assets/tower.png");
  boatSpritedata = loadJSON("assets/boat/boat.json");
  boatSpritesheet = loadImage("assets/boat/boat.png");
  brokenBoatSpritedata = loadJSON("assets/boat/broken_boat.json");
  brokenBoatSpritesheet = loadImage("assets/boat/broken_boat.png");
  waterSplashSpritedata = loadJSON("assets/water_splash/water_splash.json");
  waterSplashSpritesheet = loadImage("assets/water_splash/water_splash.png");
  playImage = loadImage("assets/play.png")
  pauseImage = loadImage("assets/pause.png")
  
}

function setup() {
  canvas = createCanvas(1200,600);
  engine = Engine.create();
  world = engine.world;
  angleMode(DEGREES)
  angle = 15
  
  checkbox = createCheckbox("",true);
  checkbox.position(15,15)
  
  if (gameState === "serve"){
    checkbox.hide();
  }

  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  playButton = Bodies.rectangle(600,300, 10,10, {isStatic:true})
  World.add(world,playButton)

  pauseButton= Bodies.rectangle(25,25,10,10,{isStatic:true})
  World.add(world,pauseButton)

  

  cannon = new Cannon(180, 110, 100, 50, angle);

  var boatFrames = boatSpritedata.frames;


  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  var brokenBoatFrames = brokenBoatSpritedata.frames;
  for (var i = 0; i < brokenBoatFrames.length; i++) {
    var pos = brokenBoatFrames[i].position;
    var img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }

  var waterSplashFrames = waterSplashSpritedata.frames;
  for (var i = 0; i < waterSplashFrames.length; i++) {
    var pos = waterSplashFrames[i].position;
    var img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    waterSplashAnimation.push(img);
  }
}

function draw() {

  checkbox.visible = true
  if (!checkbox.checked()) { // check for pause
    return ;
  }
  background(189);
  image(backgroundImg, 0, 0, width, height);

  
  if(gameState==="play"){
  World.remove(world, playButton)

  
  checkbox.show()
  
  if (!backgroundMusic.isPlaying()) {
    backgroundMusic.play();
    backgroundMusic.setVolume(0.1);
  }
  push();
  translate(pauseButton.position.x, pauseButton.position.y);
  rotate(pauseButton.angle);
  imageMode(CENTER);
  image(pauseImage, 0, 0, 50, 50);
  pop();



  Engine.update(engine);
  }

  
 
  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  
  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 0, 0, 160, 310);
  pop();
  if (gameState === "serve"){
  push();
  translate(playButton.position.x, playButton.position.y);
  rotate(playButton.angle);
  imageMode(CENTER);
  image(playImage, 0, 0, 50, 50);
  pop();
  }
  
  

  showBoats();

  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  cannon.display();

  textSize(20)
  fill("red") //fill() function changes the text color 
  text("Score: " , 840, 20)
  text("Balls fired: ", 840, 50)
  text("Shooting Rate: ", 840 , 80)
  text(score , 1155 , 20)
  text(ballsfired , 1155 ,50)
  text(shootingrate, 1155 , 80 )

  
  
  
  
}

function mousePressed(pauseButton){
  gameState="serve"
  }


function collisionWithBoat(index) {
  for (var i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);

      if (collision.collided) {
        score+=5
        boatshot+=1

        if (score === 500){

          isGameWin = true
          gameWin()
        }
        boats[i].remove(i);
        

        Matter.World.remove(world, balls[index].body);
        delete balls[index];
      }
    }
  }
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    ballsfired += 1
    if (boatshot > 0) {
      shootingrate = ballsfired/boatshot
    }
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    ball.animate();
    if (ball.body.position.x >= width || ball.body.position.y >= height - 50) {
      waterSound.play()  
      ball.remove(index);
      
    }
  }
}

function showBoats() {
  if (boats.length > 0) {
    if (
      boats.length < 4 &&
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(
        width,
        height - 100,
        170,
        170,
        position,
        boatAnimation
      );

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      Matter.Body.setVelocity(boats[i].body, {
        x: -0.9,
        y: 0
      });

      boats[i].display();
      boats[i].animate();
      var collision = Matter.SAT.collides(this.tower, boats[i].body);
      if (collision.collided && !boats[i].isBroken) {
          //Added isLaughing flag and setting isLaughing to true
          if(!isLaughing && !pirateLaughSound.isPlaying()){
            pirateLaughSound.play();
            isLaughing = true
          }
        isGameOver = true;
        gameOver();
      }
    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
} 

function keyReleased() {
  if ((keyCode === DOWN_ARROW && !isGameOver) && (keyCode === DOWN_ARROW && !isGameWin)) {
    cannonExplosion.play();
    balls[balls.length - 1].shoot();
  }
}

function mousePressed(playButton){
  gameState="play"
  World.remove(world,playButton)
  World.remove(world,playImage)

}




function gameWin(){
  swal(
    {
    title: `Well done!!`,
    text: "You are a champion!",
    imageUrl:"https://www.pngrepo.com/png/228297/512/trophy-champion.png",
    imageSize: "150x150",
    confirmButtonText : "Play Again"
    }, 
    function(isConfirm){
      if (isConfirm){
        location.reload()
      }
    }
  )
}


function gameOver() {
  swal(
    {
      title: `Game Over!!!`,
      text: "Thanks for playing!!",
      imageUrl:
        "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
      imageSize: "150x150",
      confirmButtonText: "Play Again"
    },
    function(isConfirm) {
      if (isConfirm) {
        location.reload();
      }
    }
  );
}
