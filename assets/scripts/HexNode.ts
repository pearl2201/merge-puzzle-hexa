import { _decorator, Component, Node, Vec3 } from 'cc';
import { Hex, HexVectorExtensions } from './Hex';
const { ccclass, property } = _decorator;

@ccclass('HexNode')
export class HexNode extends Component {
    @property()
    id: number = 0;
    @property()
    dir: number;
    @property()
    randomizeDir: boolean = false;
    @property()
    lockY: boolean = false;

    protected start(): void {
        this.ApplyTransform();
    }
    public getHex(): Hex {
        return HexVectorExtensions.Vec3ToHex(this.node.worldPosition);
    }

    public getLocalHex(): Hex {
        return HexVectorExtensions.Vec3ToHex(this.node.position);
    }

    public ApplyTransform() {
        if (this.randomizeDir) {
            let hex: Hex = this.getHex();
            let i: number = hex.q * 100 + hex.r;
            this.dir = ((i % 6) + 6) % 6;
        }
        let y: number = this.lockY ? 0 : this.node.position.y;
        console.log(this.id,this.getLocalHex());
        let newPos = this.getLocalHex().ToWorld(y);
        console.log(this.id,newPos);
        this.node.position = newPos;
        this.node.eulerAngles = new Vec3(0, -60 * this.dir, 0);
    }
}


