"use strict";

import * as renderer from "./boid_renderer.js";
import { Boid, BOID_SPEED, WRAP_BORDER, updateSpeed } from "./boid.js";

const clearRed = 25.0 / 255.0;
const clearGreen = 25.0 / 255.0;
const clearBlue = 25.0 / 255.0;

const triangleVertices = [
    new renderer.Vec2(0, 1),
    new renderer.Vec2(-0.8, -1),
    new renderer.Vec2(0.8, -1)
]

const BOID_SCALE = 0.05;
const BOID_COUNT = 100;

let range = n => [...Array(n).keys()];

const vertexShaderSource = `#version 300 es
in vec2 position;
uniform vec2 offset;
uniform float rotation;
uniform float aspectRatio;

out vec2 outPos;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, s, -s, c);
	return m * v;
}

void main() {
    vec2 rotatedPosition = rotate(position, rotation);
    vec2 scaledPos = vec2(rotatedPosition.x / aspectRatio , rotatedPosition.y);
    
    outPos = scaledPos + offset;
    gl_Position = vec4(scaledPos + offset, 0, 1);
}
`

const fragmentShaderSource = `#version 300 es

precision highp float;

in vec2 outPos;

out vec4 outColor;

void main() {
    outColor = vec4((outPos.x + 1.0) / 2.0, (outPos.y + 1.0) / 2.0, 1.0, 1);
}
`

function main() {
    let canvas = document.getElementById("boidCanvas");

    let gl = canvas.getContext("webgl2");

    if (!gl) {
        canvas.style.backgroundColor =
            `rgb(${Math.round(clearRed * 255)}, ${Math.round(clearGreen * 255)}, ${Math.round(clearBlue * 255)})`;
    }

    let vertexShader = renderer.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = renderer.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    let program = renderer.createShaderProgram(gl, vertexShader, fragmentShader);

    for (let vertex of triangleVertices) {
        vertex.scale(BOID_SCALE);
    }

    let packedVertices = [];
    for (let vertex of triangleVertices) {
        packedVertices.push(vertex.x);
        packedVertices.push(vertex.y);
    }
    
    let posLocation = gl.getAttribLocation(program, "position");
    let vao = renderer.create2DVertexBuffer(gl, new Float32Array(packedVertices), posLocation);

    let boids = new Array(BOID_COUNT).fill().map(() => new Boid());

    for (let boid of boids) {
        boid.positionX = Math.random() * 2 * WRAP_BORDER - WRAP_BORDER;
        boid.positionY =  Math.random() * 2 * WRAP_BORDER - WRAP_BORDER;
        boid.velocityX = (Math.random() * 2 - 1) * BOID_SPEED;
        boid.velocityY =  (Math.random() * 2 - 1) * BOID_SPEED;
    }

    requestAnimationFrame(() => {render(gl, program, vao, boids)});
}

function render(gl, program, vao, boids) {
    gl.canvas.width = Math.round(gl.canvas.clientWidth / 6);
    gl.canvas.height = Math.round(gl.canvas.clientHeight / 6);
    updateSpeed(4 / ((gl.canvas.clientWidth + gl.canvas.clientHeight)));
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    let desiredNumber = Math.round(gl.canvas.clientWidth / 8);

    if (desiredNumber > boids.length) {
        for (let _ of range(desiredNumber - boids.length)) {
            let boid = new Boid();
            boid.positionX = Math.random() * 2 * WRAP_BORDER - WRAP_BORDER;
            boid.positionY =  Math.random() * 2 * WRAP_BORDER - WRAP_BORDER;
            boid.velocityX = (Math.random() * 2 - 1) * BOID_SPEED;
            boid.velocityY =  (Math.random() * 2 - 1) * BOID_SPEED;
            boids.push(boid);
        }
    } else if (desiredNumber < boids.length) {
        for (let _ of range(boids.length - desiredNumber)) {
            boids.pop();
        }
    }

    let offsetUniformLoc = gl.getUniformLocation(program, "offset");
    let rotationUniformLoc = gl.getUniformLocation(program, "rotation");
    let ratioUniformLoc = gl.getUniformLocation(program, "aspectRatio");

    gl.useProgram(program);
    gl.bindVertexArray(vao);

    gl.clearColor(clearRed, clearGreen, clearBlue, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (let boid of boids)
    {
        boid.update(boids);
    }

    for (let boid of boids)
    {
        gl.uniform2f(offsetUniformLoc, boid.positionX, boid.positionY);
        gl.uniform1f(rotationUniformLoc, boid.rotation);
        gl.uniform1f(ratioUniformLoc, gl.canvas.width / gl.canvas.height);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    requestAnimationFrame(() => {render(gl, program, vao, boids)})
}

main();

