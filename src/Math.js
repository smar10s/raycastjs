export class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static create(x, y, z) {
        return new Vector3(x, y, z);
    }

    length() {
        const {x, y, z} = this;
        return Math.sqrt((x * x) + (y * y) + (z * z));
    }

    normalize() {
        const {x, y, z} = this;
        const l = 1 / this.length();

        return new this.constructor(x * l, y * l, z * l);
    }

    add(v) {
        const {x, y, z} = this;
        return new this.constructor(x + v.x, y + v.y, z + v.z);
    }

    subtract(v) {
        const {x, y, z} = this;
        return new this.constructor(x - v.x, y - v.y, z - v.z);
    }

    multiply(v) {
        const {x, y, z} = this;
        return new this.constructor(x * v.x, y * v.y, z * v.z);
    }

    multiplyScalar(s) {
        const {x, y, z} = this;
        return new this.constructor(x * s, y * s, z * s);
    }

    divideScalar(s) {
        return this.multiplyScalar(1 / s);
    }

    dot(v) {
        const {x, y, z} = this;
        return (x * v.x) + (y * v.y) + (z * v.z);
    }

    // Returns vector reflected by normal
    reflect(normal) {
        return this.subtract(normal.multiplyScalar(2 * this.dot(normal)));
    }

    // Returns ray start from this vector in given direction, optional 'nudged' towards direction by Epsilon
    createRay(direction, Epsilon = 0.0001) {
        const origin = Epsilon ? this.add(direction.multiplyScalar(Epsilon)) : this;
        return new Ray(origin, direction);
    }

    // Returns this vector with random values up to r added towards each component
    disturb(r = 0.01) {
        return this.add(Vector3.create(
            ((2 * Math.random()) - 1) * r,
            ((2 * Math.random()) - 1) * r,
            ((2 * Math.random()) - 1) * r,
        ));
    }
}

export class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }
}
