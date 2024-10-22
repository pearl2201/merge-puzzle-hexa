import { Vec2, Vec3 } from 'cc';

export class HexVectorExtensions {
    static WorldToPlanar(world: Vec3): Vec2 {
        return new Vec2(world.x, world.y);
    }

    static PlanarToWorld(planar: Vec2, z = 0): Vec3 {
        return new Vec3(planar.x, planar.y,z);
    }

    static Vec3ToHex(world: Vec3): Hex {
        return Hex.FromWorld(world);
    }

    static Vec2ToHex(planar: Vec2): Hex {
        return Hex.FromPlanar(planar);
    }
}

export class Hex {
    static RADIUS = 0.5;
    static Q_BASIS = new Vec2(2, 0).multiplyScalar(Hex.RADIUS);
    static R_BASIS = new Vec2(1, Math.sqrt(3)).multiplyScalar(Hex.RADIUS);
    static Q_INV = new Vec2(1 / 2, -Math.sqrt(3) / 6);
    static R_INV = new Vec2(0, Math.sqrt(3) / 3);

    static AXIAL_DIRECTIONS: Hex[] = [
        new Hex(1, 0), // 0
        new Hex(0, 1), // 1
        new Hex(-1, 1), // 2
        new Hex(-1, 0), // 3
        new Hex(0, -1), // 4
        new Hex(1, -1), // 5
    ];

    static FromPlanar(planar: Vec2): Hex {
        const q = Vec2.dot(planar, Hex.Q_INV) / Hex.RADIUS;
        const r = Vec2.dot(planar, Hex.R_INV) / Hex.RADIUS;
        return new Hex(q, r);
    }

    static FromWorld(world: Vec3): Hex {
        const planar = HexVectorExtensions.WorldToPlanar(world);
        console.log(planar);
        return Hex.FromPlanar(planar);
    }

    static zero = new Hex(0, 0);

    static Ring(center: Hex, radius: number): Hex[] {
        let current = Hex.add(center, new Hex(0, -radius));
        const result: Hex[] = [];
        for (const dir of Hex.AXIAL_DIRECTIONS) {
            for (let i = 0; i < radius; i++) {
                result.push(current);
                current = Hex.add(current, dir);
            }
        }
        return result;
    }

    static Spiral(center: Hex, minRadius: number, maxRadius: number): Hex[] {
        const result: Hex[] = [];
        if (minRadius === 0) {
            result.push(center);
            minRadius += 1;
        }
        for (let r = minRadius; r <= maxRadius; r++) {
            const ring = Hex.Ring(center, r);
            result.push(...ring);
        }
        return result;
    }

    static FloodFill(startFrom: Hex[]): Hex[] {
        const visited: Set<string> = new Set();
        const frontier: Hex[] = [...startFrom];
        const result: Hex[] = [];
        while (frontier.length > 0) {
            const current = frontier.shift()!;
            result.push(current);
            for (const next of current.Neighbours()) {
                const nextKey = next.toString();
                if (visited.has(nextKey)) {
                    continue;
                }
                visited.add(nextKey);
                frontier.push(next);
            }
        }
        return result;
    }

    static add(a: Hex, b: Hex): Hex {
        return new Hex(a.q + b.q, a.r + b.r);
    }

    static sub(a: Hex, b: Hex): Hex {
        return new Hex(a.q - b.q, a.r - b.r);
    }

    q: number;
    r: number;

    constructor(q: number, r: number) {
        this.q = Math.round(q);
        this.r = Math.round(r);
    }

    ToPlanar(): Vec2 {
        return Hex.Q_BASIS.multiplyScalar(this.q).add(Hex.R_BASIS.multiplyScalar(this.r));
    }

    ToWorld(y = 0): Vec3 {
        const temp = this.ToPlanar();
        console.log(temp)
        return new Vec3(temp.x, temp.y, 0).multiply(new Vec3(1, 1, 0));
    }

    Neighbours(): Hex[] {
        const result: Hex[] = [];
        for (const dir of Hex.AXIAL_DIRECTIONS) {
            result.push(Hex.add(this, dir));
        }
        return result;
    }

    GetNeighbour(dir: number): Hex {
        const incr = Hex.AXIAL_DIRECTIONS[dir % Hex.AXIAL_DIRECTIONS.length];
        return Hex.add(this, incr);
    }

    DistanceTo(to: Hex): number {
        return (
            Math.abs(this.q - to.q) +
            Math.abs(this.q + this.r - to.q - to.r) +
            Math.abs(this.r - to.r)
        ) / 2;
    }

    toString(): string {
        return `(${this.q};${this.r})`;
    }
}