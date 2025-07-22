export function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    console.log(gl.getShaderInfoLog(shader));

    return shader;
}

export function createShaderProgram(gl, vertexShader, fragmentShader)
{
    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    console.log(gl.getProgramInfoLog(program));

    return program;
}

// Requires position attribute in vertex shader
export function create2DVertexBuffer(gl, vertices, bufferAttributeLoc)
{

    let posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);  

    gl.vertexAttribPointer(bufferAttributeLoc, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(bufferAttributeLoc);

    return vao;
}

export class Vec2 {
    constructor(x, y) {
        this.x = x,
        this.y = y
    }

    translate(x, y) {
        this.x += x;
        this.y += y;
    }
    
    translate(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    scale(factor) {
        this.x *= factor;
        this.y *= factor;
    }

    difference(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    magnitude() {
        return Math.sqrt(this.x ^ 2 + this.y ^ 2);
    }

    distanceTo(other) {
        return this.difference(other).magnitude();
    }

    normalized() {
        let mag = this.magnitude();
        return new Vec2(this.x / mag, this.y / mag);
    }

    normalize() {
        let mag = this.magnitude();
        this.x /= mag;
        this.y /= mag;
    }

    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
}