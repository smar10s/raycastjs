import {Ray, Vector3} from './Math.js';
import {Color, Light} from './Scene.js';

export class Renderer {
    constructor(scene, config = {MaxTraceDepth: 3, Shadows: 32}) {
        this.scene = scene;

        Object.assign(this, config);
    }

    // Determine occlusion between light and point in scene
    occlusion(light, point) {
        const {primitives} = this.scene;
        const L = light.center.subtract(point); // Measure distance of L before normalizing
        const distance = L.length();
        const ray = point.createRay(L.normalize());

        let total = 0;
        for (let n = 0; n < this.Shadows; n += 1) {
            for (let i = 0; i < primitives.length; i += 1) {
                const primitive = primitives[i];
                const d = primitive.intersect(new Ray(ray.origin, ray.direction.disturb()));

                if (!(primitive instanceof Light) && d !== -1 && d < distance) {
                    total += 1;
                }
            }
        }

        return total / this.Shadows;
    }

    illuminate(primitive, distance, ray, depth) {
        const {lights} = this.scene;
        const {material} = primitive;
        const intersection = ray.origin.add(ray.direction.multiplyScalar(distance)); // Point of intersection (i.e. distance along direction from origin)
        const N = primitive.getNormal(intersection);
        const V = ray.direction;
        let color = Color.Black;

        if (primitive instanceof Light) {
            return Color.White;
        }

        // Phong shading:
        // intensity = diffuse * (L.N) + specular * (V.R)n
        // L is the vector from the intersection point to the light source
        // N is the plane normal
        // V is the view direction
        // R is L reflected in the surface
        for (let i = 0; i < lights.length; i++) {
            const light = lights[i];
            const lightColor = light.material.color;
            const L = light.center.subtract(intersection).normalize();
            const visibility = 1 - this.occlusion(light, intersection);

            // Diffuse lighting
            if (material.diffuse > 0) {
                const LN = L.dot(N);

                if (LN > 0) {
                    const rayColor = lightColor.multiplyScalar(LN * material.diffuse * visibility);
                    color = color.add(material.color.multiply(rayColor)); // Diffuse ray with material color and add
                }
            }

            // Specular lighting
            if (material.specular > 0) {
                const R = L.reflect(N);
                const VR = V.dot(R);

                if (VR > 0) {
                    const rayColor = lightColor.multiplyScalar((VR ** 20) * material.specular * visibility);
                    color = color.add(rayColor); // Add ray color directly (i.e. it 'shines')
                }
            }
        }

        // Reflections
        if (material.reflection > 0) {
            const reflectedColor = this.trace(intersection.createRay(V.reflect(N)), depth + 1);
            const rayColor = reflectedColor.multiplyScalar(material.reflection);
            color = color.add(material.color.multiply(rayColor)); // Diffuse ray with material color and add
        }

        return color;
    }

    trace(ray, depth = 0) {
        const {primitives} = this.scene;
        let primitive = null;
        let distance = null;

        if (depth > this.MaxTraceDepth) {
            return Color.Black;
        }

        for (let i = 0; i < primitives.length; i++) {
            const intersects = primitives[i].intersect(ray);

            if (intersects !== -1 && (distance === null || distance > intersects)) {
                primitive = primitives[i];
                distance = intersects;
            }
        }

        return primitive ? this.illuminate(primitive, distance, ray, depth) : Color.Black;
    }

    render(canvas) {
        const {scene} = this;
        const origin = scene.camera;
        const {width, height} = canvas;
        const dx = (scene.maxx - scene.minx) / width;
        const dy = (scene.maxy - scene.miny) / height;
        const context = canvas.getContext('2d');
        const image = context.createImageData(width, height);

        for (let y = 0, sy = scene.miny; y < height; y++, sy += dy) {
            for (let x = 0, sx = scene.minx; x < width; x++, sx += dx) {
                const direction = Vector3.create(sx, sy, 0).subtract(origin).normalize();
                const color = this.trace(new Ray(origin, direction));
                const i = 4 * ((((height - y) - 1) * width) + x); // Flip Y

                image.data.set(color.rgba(), i);
            }
        }

        context.putImageData(image, 0, 0);
    }
}
