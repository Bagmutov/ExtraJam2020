import { roomw, roomh, camy, camx, mainCanv } from "./main.js";
export let backCanv = document.getElementById('backcan');
export let backctx = backCanv.getContext('2d');
export class Cosmetics {
    static draw(ctx) {
        ctx.strokeStyle = '#777777';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.save();
        ctx.translate(-camx, -camy);
        let cx = -camx - roomw / 2, cy = -camy - roomh / 2;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                for (let ln of this.backgr[this.ry + i][this.rx + j]) {
                    ctx.moveTo(ln.x1, ln.y1);
                    ctx.lineTo(ln.x2, ln.y2);
                }
                ctx.translate(roomw, 0);
            }
            ctx.translate(-3 * roomw, 0);
            ctx.translate(0, roomh);
        }
        ctx.stroke();
        ctx.restore();
        backctx.clearRect(0, 0, backCanv.width, backCanv.height);
        let offx = (1 - this.scale) * mainCanv.width * .5, offy = (1 - this.scale) * mainCanv.height * .5;
        backctx.drawImage(mainCanv, 0, 0, mainCanv.width, mainCanv.height, offx, offy, this.scale * mainCanv.width, this.scale * mainCanv.height);
    }
    static setActRoom(rx, ry) {
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++)
                this.crtBackgr(rx + j, ry + i);
        this.rx = rx;
        this.ry = ry;
    }
    static crtBackgr(cx, cy) {
        if (!this.backgr[cy])
            this.backgr[cy] = [];
        if (!this.backgr[cy][cx])
            this.backgr[cy][cx] = this.getNet(cx, cy);
    }
    static getNet(cx, cy, type = 'square') {
        let net = [];
        switch (type) {
            case 'hex':
                break;
            case 'square':
                let xx = this.size - ((roomw * cx) % this.size + this.size) % this.size, sy = this.size - ((roomh * cy) % this.size + this.size) % this.size, yy;
                while (xx <= roomw) {
                    yy = sy;
                    while (yy <= roomh) {
                        net.push({ x1: xx, y1: yy, x2: xx + this.size, y2: yy });
                        net.push({ x1: xx, y1: yy, x2: xx, y2: yy + this.size });
                        yy += this.size;
                    }
                    xx += this.size;
                }
                break;
        }
        return net;
    }
}
Cosmetics.backgr = [];
Cosmetics.size = 300;
Cosmetics.scale = .9;
//# sourceMappingURL=cosmetics.js.map