const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const ambientSound = document.getElementById("ambientSound");
const failSound = document.getElementById("failSound");
const pulo = new Audio("/sound/pulo.mp3");


const cactoImage = new Image();
cactoImage.src = "/imagens/cacto1.png";
const dinoImages = {
  dino1: new Image(),
  dino2: new Image(),
  dino3: new Image(),
  dino4: new Image(),
  dino5: new Image(),
};

dinoImages.dino1.src = "/imagens/dino1.png";
dinoImages.dino2.src = "/imagens/dino2.png";
dinoImages.dino3.src = "/imagens/dino3.png";
dinoImages.dino4.src = "/imagens/dino4.png";
dinoImages.dino5.src = "/imagens/dino5.png";

// Variáveis do jogo
let dino = {
  x: 50,
  y: 50,
  width: 100,
  height: 150,
  dy: 0,
  jumpStrength: 15,
  gravity: 0.5,
  grounded: false,
};

let obstacles = [];
let gameSpeed = 5;
let score = 0;
// Variável para controlar a troca de imagem do dinossauro a cada x segundos
let lastImageChangeTime = 0;
const imageChangeInterval = 50;
const lines = [];

// Variável para armazenar a imagem atual do dinossauro
// Variáveis para controle da imagem do dinossauro
const dinoImagesArray = [
  dinoImages.dino2,
  dinoImages.dino3,
  dinoImages.dino4,
  dinoImages.dino5,
];

let currentImageIndex = 0;

// Função para desenhar o dinossauro
function drawDino() {
  const now = Date.now();

  if (!dino.grounded) {
    ctx.drawImage(dinoImages.dino1, dino.x, dino.y, dino.width, dino.height);
    return; // Retorna para evitar a troca de imagem durante o salto
  }

  // Trocar a imagem do dinossauro a cada 5 segundos
  if (now - lastImageChangeTime >= imageChangeInterval) {
    lastImageChangeTime = now;
    currentImageIndex = (currentImageIndex + 1) % dinoImagesArray.length; // Incrementa e reseta o índice
  }

  // Desenhar o dinossauro com a imagem atual
  const currentDinoImage = dinoImagesArray[currentImageIndex];
  ctx.drawImage(currentDinoImage, dino.x, dino.y, dino.width, dino.height);
}

// Função para desenhar obstáculos
function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.drawImage(
      cactoImage,
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );
  });
}

function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Função para atualizar obstáculos
function updateObstacles() {
  obstacles.forEach((obstacle) => {
    obstacle.x -= gameSpeed;
  });

  if (
    obstacles.length === 0 ||
    obstacles[obstacles.length - 1].x < canvas.width - 200
  ) {
    let obstacle = {
      x: canvas.width + randomIntFromRange(100, 200),
      y: 380,
      width: randomIntFromRange(60, 80),
      height: randomIntFromRange(100, 130),
    };
    obstacles.push(obstacle);
  }

  if (obstacles[0].x + obstacles[0].width < 0) {
    obstacles.shift();
    score++;
  }
}

function drawGround() {
  const x = 0;
  const y = 450;
  const largura = 1200; // Defina a largura da linha

  ctx.strokeStyle = "#525252"; // Cor da borda
  ctx.lineWidth = 2; // Espessura da borda

  ctx.beginPath(); // Iniciar um novo caminho
  ctx.moveTo(x, y); // Mover para o ponto inicial
  ctx.lineTo(x + largura, y); // Desenhar uma linha até o ponto final
  ctx.stroke(); // Aplicar a borda
}

function drawLines() {
  ctx.strokeStyle = "#525252"; // Cor da linha
  ctx.lineWidth = 2; // Espessura da linha

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.stroke();
  }
}

function updateLines() {
  for (let i = 0; i < lines.length; i++) {
    lines[i].x1 -= gameSpeed;
    lines[i].x2 -= gameSpeed;
  }

  // Determinar quantas novas linhas serão criadas a cada atualização
  const numNewLines = randomIntFromRange(0, 1); // Por exemplo, entre 1 e 3 novas linhas

  for (let i = 0; i < numNewLines; i++) {
    // Gerar coordenadas para a nova linha
    const x1 = canvas.width + randomIntFromRange(5, 10);
    const y = randomIntFromRange(460, 490);
    const x2 = canvas.width + randomIntFromRange(10, 20);

    // Criar a nova linha e adicioná-la à matriz de linhas
    const newLine = { x1: x1, y1: y, x2: x2, y2: y };
    lines.push(newLine);
  }

  // Remover linhas que já passaram do canvas
  if (lines.length > 0 && lines[0].x2 < 0) {
    lines.shift();
  }
}

// Função para detectar colisão
function detectCollision() {
  obstacles.forEach((obstacle) => {
    if (
      dino.x < obstacle.x + obstacle.width &&
      dino.x + dino.width > obstacle.x &&
      dino.y < obstacle.y + obstacle.height &&
      dino.y + dino.height > obstacle.y
    ) {
      // Colisão detectada
      ambientSound.pause();
      failSound.play();
      alert("Game Over! Score: " + score);
      document.location.reload();
    }
  });
}

// Função para atualizar o dinossauro
function updateDino() {
  if (dino.grounded && dino.dy === 0 && isJumping) {
    dino.dy = -dino.jumpStrength;
    dino.grounded = false;
    // Mudar para outra imagem quando o jogador pressionar para pular
    currentDinoImage = dinoImages.dino1;
  }

  dino.dy += dino.gravity;
  dino.y += dino.dy;

  if (dino.y + dino.height > canvas.height - 10) {
    dino.y = canvas.height - 10 - dino.height;
    dino.dy = 0;
    dino.grounded = true;
  }
}

// Variável para detectar se o jogador está tentando pular
let isJumping = false;
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    isJumping = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    isJumping = false;
    pulo.play();
  }
});


function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, canvas.width - 120, 30);
}


// Função para desenhar o jogo
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGround();
  drawDino();
  drawObstacles();
  drawLines();
  drawScore();
}

// Função para atualizar o jogo
function update() {
  updateDino();
  updateObstacles();
  updateLines();
  detectCollision();
}

// Função principal do jogo
function gameLoop() {
  ambientSound.play()
  draw();
  update();
  requestAnimationFrame(gameLoop);
}

// Iniciar o loop do jogo
gameLoop();
