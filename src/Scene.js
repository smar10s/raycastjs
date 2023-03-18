import {Vector3} from './Math.js';

export class Color extends Vector3 {
    static Black = new Color(0, 0, 0);
    static White = new Color(1, 1, 1);

    rgba() {
        return [
            Math.min(255, this.x * 255),
            Math.min(255, this.y * 255),
            Math.min(255, this.z * 255),
            255,
        ];
    }
}

export class Material {
    constructor(color = new Color(0.2, 0.2, 0.2), reflection = 0, diffuse = 0.2) {
        this.color = color;
        this.reflection = reflection;
        this.diffuse = diffuse;
        this.specular = 1 - diffuse;
    }
}

class Primitive {
    constructor(material = new Material()) {
        this.material = material;
    }
}

export class Sphere extends Primitive {
    constructor(center, radius, material) {
        super(material);
        this.center = center;
        this.radius = radius;
    }

    intersect(ray) {
        const v = ray.origin.subtract(this.center);
        const b = -v.dot(ray.direction);
        const det = (b * b) - v.dot(v) + (this.radius * this.radius);

        if (det > 0) {
            const i1 = b - Math.sqrt(det);
            const i2 = b + Math.sqrt(det);

            if (i2 > 0) {
                return i1 < 0 ? i2 : i1;
            }
        }

        return -1;
    }

    getNormal(position) {
        return position.subtract(this.center).divideScalar(this.radius);
    }
}

export class Plane extends Primitive {
    constructor(normal, distance, material) {
        super(material);
        this.normal = normal;
        this.distance = distance; // Distance from origin
    }

    intersect(ray) {
        const dot = this.normal.dot(ray.direction);

        if (dot !== 0) {
            const distance = -(this.normal.dot(ray.origin) + this.distance) / dot;

            return distance > 0 ? distance : -1;
        }

        return -1;
    }

    getNormal(_position) {
        return this.normal;
    }
}

export class Light extends Sphere {
}

export class Scene {
    constructor(extent, camera, primitives) {
        this.minx = extent[0];
        this.maxx = extent[1];
        this.miny = extent[2];
        this.maxy = extent[3];
        this.camera = camera;
        this.primitives = primitives;
        this.lights = primitives.filter(p => p instanceof Light);
    }
}
