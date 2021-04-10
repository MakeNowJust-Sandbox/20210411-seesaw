import {
  Bodies,
  Body,
  Composite,
  Engine,
  Events,
  Render,
  Vector
} from "matter-js";

const LOCALSTORAGE_KEY = 'seesaw-highscore';
let highScore = +(localStorage.getItem(LOCALSTORAGE_KEY) ?? 0);
let currentScore = 0;

const canvas = document.querySelector<HTMLCanvasElement>('#app')!;
const score = document.querySelector<HTMLParagraphElement>('#score')!;

const engine = Engine.create();
const render = Render.create({ canvas, engine, options: {wireframes: false} });

Engine.run(engine);
Render.run(render);

const ground = Bodies.rectangle(400, 800, 1600, 200, {isStatic: true});
const circle = Bodies.circle(400, 200, 10, {mass: 1, render: {fillStyle: '#F4F'}});
const bar = Bodies.rectangle(400, 500, 400, 10, {mass: 2, friction: 0.2, render: {fillStyle: '#BBB'}});
const base = Bodies.fromVertices(400, 560, [[Vector.create(-10, -50), Vector.create(10, -50), Vector.create(20, 50), Vector.create(-20, 50)]],  {isStatic: true, render: {fillStyle: '#BBB'}});

const boxes = new Set();

setInterval(() => {
  if (Math.random() <= 0.2) {
    const box = Bodies.rectangle(200 + Math.random() * 400, 200, 10, 10);
    Body.setMass(box, Math.random() <= 0.5 ? 1 : 0.3);
    box.friction = 0.01;
    Composite.add(engine.world, box);
    boxes.add(box);
  }
  score.textContent = `SCORE: ${~~currentScore} (HIGH: ${~~Math.max(currentScore, highScore)})`;
}, 200);

Events.on(engine, 'collisionStart', ({pairs}) => {
  const finished = pairs.filter(c => c.bodyA === ground || c.bodyB === ground).map(c => c.bodyA === ground ? c.bodyB : c.bodyA);
  for (const body of finished) {
    if (body === circle || body === bar) {
      Body.setPosition(circle, Vector.create(400, 200));
      Body.setAngle(circle, 0);
      Body.setVelocity(circle, Vector.create(0, 0))
      Body.setPosition(bar, Vector.create(400, 500));
      Body.setAngle(bar, 0);
      Body.setVelocity(bar, Vector.create(0, 0))
      highScore = Math.max(highScore, currentScore);
      currentScore = 0;
      localStorage.setItem(LOCALSTORAGE_KEY, ''+highScore);
    }
    if (boxes.has(body)) {
      Composite.remove(engine.world, body);
      boxes.delete(body);
      currentScore += 10000 * Math.random();
    }
  }
});


Composite.add(engine.world, ground);
Composite.add(engine.world, circle);
Composite.add(engine.world, bar);
Composite.add(engine.world, base);

canvas.addEventListener('mousemove', event => {
  const x = Math.max(200, Math.min(600, event.offsetX));
  Body.setPosition(base, Vector.create(x, base.position.y));
  currentScore += Math.random() * 20;
});
