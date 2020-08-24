import { drawCircle } from "./tech.js";
import { allRooms, crtRoom, allObjects, colliderMain, actRoom, roomw, roomh, camx, setCam, camy, toDestroy, bigText } from "./main.js";
import { Cosmetics } from "./cosmetics.js";
import { dist2Pt, mmin, mmax, arrFindMin, dist2, arrSortOne } from "./math.js";
export class FieldObject {
    constructor(x, y, vx, vy, rad, mass) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.rad = rad;
        this.mass = mass;
        this.fx = 0;
        this.fy = 0;
        this.color = '#444444';
        this.edible = false;
    }
    get c_x() { return this.x + this.vx; }
    get c_y() { return this.y + this.vy; }
    drawMe(ctx) {
        drawCircle(ctx, this.x, this.y, this.rad, this.color);
    }
    step() {
        this.x = (this.x + this.vx);
        this.y += this.vy;
        this.vx = (this.vx + this.fx) * .97;
        this.vy = (this.vy + this.fy) * .97;
        this.fx = 0;
        this.fy = 0;
    }
    activate() {
        allObjects.push(this);
        arrSortOne(allObjects, o => o.rad, true);
        colliderMain.addObj(this, 0);
    }
    deactivate() {
        colliderMain.delObj({ obj: this });
        let ind = allObjects.indexOf(this);
        if (ind >= 0)
            allObjects.splice(ind, 1);
        else
            console.log('error del obj from all');
    }
    setRoom(ro) {
        this.room = ro;
    }
    jumpCoord(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    collide(obj) {
        return true;
    }
    destroy() {
        if (this.room)
            this.room.delObj(this);
    }
}
export class Natto extends FieldObject {
    constructor(x, y, vx, vy, rad, mass) {
        super(x, y, vx, vy, rad, mass);
        this.maxCon = 3;
        this.conns = [];
        this.pull = .001;
        this.maxD2 = 40000;
        this.minD2 = 8000;
        this.color = '#66aa66';
        this.edible = true;
    }
    step() {
        super.step();
        let dx, dy, cn, i = 0, dd;
        while (i < this.conns.length) {
            cn = this.conns[i];
            dd = dist2Pt(cn, this);
            if (dd > this.maxD2)
                this.conns.splice(i, 1);
            else {
                if (dd > this.minD2 || cn['doeating']) {
                    dx = (this.x - cn.x) * this.pull;
                    dy = (this.y - cn.y) * this.pull;
                    // dx=sign(this.x-cn.x)*this.pull;
                    // dy=sign(this.y-cn.y)*this.pull;
                    this.fx -= dx;
                    this.fy -= dy;
                    if (cn['doeating']) {
                        this.fx -= dx;
                        this.fy -= dy;
                    }
                    // cn.fx+=dx;
                    // cn.fy+=dy;
                }
                i++;
            }
        }
    }
    drawMe(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = '#66aa66';
        ctx.lineWidth = 3;
        for (let cn of this.conns) {
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(cn.x, cn.y);
        }
        ctx.stroke();
        super.drawMe(ctx);
    }
    collide(obj) {
        if (this.conns.indexOf(obj) >= 0)
            return;
        // if(this.conns.length==this.maxCon)//
        if (!(obj instanceof Natto))
            this.conns.pop();
        if (this.conns.length < this.maxCon)
            this.connectTo(obj);
        return true;
    }
    connectTo(obj) {
        if (this.conns.length >= this.maxCon)
            this.conns.pop();
        this.conns.push(obj);
    }
}
export class Face extends FieldObject {
    constructor(x, y, vx, vy, rad, mass, eyeN = ~~(Math.random() * 4) + 1) {
        super(x, y, vx, vy, rad, mass);
        this.eyes = [];
        this.mouth = new Mouth(-20, 0);
        this.randtimer = 10;
        this.lookhim = null;
        this.border = [];
        this.emotimer = -1;
        this.doeating = false;
        this.monolog = ['Hello, nice to meet you!', 'now go'];
        this.color = getRndClr();
        eyeN++;
        for (let i = 1; i <= (eyeN - 1); i++)
            this.eyes.push(new Eye(i * rad * 2 / eyeN - rad - 20, Math.sin(3.14 + 3 * i / eyeN) * rad * .5 - 10, 0));
        let nn = 11;
        for (let i = 0; i < nn; i++) {
            this.border.push(new Follower(Math.cos(6.28 / nn * i) * rad * 1.1, Math.sin(6.28 / nn * i) * rad * 1.1));
        }
    }
    drawMe(ctx) {
        // super.drawMe(ctx);
        ctx.beginPath();
        // ctx.moveTo(this.x+this.rad,this.y);
        for (let br of this.border) {
            ctx.lineTo(this.x + br.x, this.y + br.y);
        }
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.translate(this.x, this.y);
        for (let ey of this.eyes) {
            ey.drawMe(ctx);
        }
        this.mouth.drawMe(ctx);
        ctx.translate(-this.x, -this.y);
    }
    step() {
        super.step();
        for (let ey of this.eyes)
            ey.step(-this.vx, -this.vy);
        this.mouth.step(0, 0);
        for (let br of this.border)
            br.step(-this.vx, -this.vy);
        if (this.randtimer-- < 0) {
            this.randtimer = Math.random() * 10 + 10;
            this.eyes[~~(this.eyes.length * Math.random())].randomize();
            this.border[~~(this.border.length * Math.random())].randomize();
            this.mouth.randomize();
            // this.eyes[~~(this.eyes.length*Math.random())].randomizeIris();
        }
        if (this.lookhim)
            this.lookAt(this.lookhim);
        if (--this.emotimer == 0) {
            this.defaultEmo();
        }
        // console.log(this.food);
    }
    defaultEmo() {
        this.mouth.tp = 0;
        this.eyes.forEach(e => e.tp = 0);
    }
    collide(obj) {
        if (obj instanceof Face) {
            // setTimeout(()=>{this.lookhim=null;this.eyes.forEach(e=>{e.randomizeIris()})},2000*Math.random());
            this.lookhim = obj; //
            let mn = arrFindMin(this.border, br => { return dist2(obj.x - this.x - br.x, obj.y - this.y - br.y); });
            mn.o.vx += -mn.o.sx * obj.mass * .02;
            mn.o.vy += -mn.o.sy * obj.mass * .02;
        }
        if (obj.edible) {
            // console.log('collide');
            if (this.doeating)
                this.eat(obj);
        }
        if (obj instanceof Player && this.monolog.length) {
            bigText.str = this.monolog.shift();
            bigText.t = 300;
        }
        return true;
    }
    eat(obj) {
        if (obj instanceof Natto) {
            obj.conns.forEach(cn => { if (cn instanceof Natto)
                cn.connectTo(this); });
        }
        if (obj.rad-- <= 5)
            toDestroy.push(obj);
    }
    lookAt(obj) {
        for (let ey of this.eyes)
            ey.lookAt(obj.x - this.x, obj.y - this.y);
    }
    spit(sin, cos, pow, objs) {
        for (let o of objs) {
            o.x = this.x + this.rad * cos * 1.5 - this.room.position.x;
            o.y = this.y + this.rad * sin * 1.5 - this.room.position.y;
            pow *= 10;
            o.vx = pow * cos;
            o.vy = pow * sin;
            this.room.addObj(o);
        }
    }
}
class Follower {
    constructor(dx, dy) {
        this.dx = dx;
        this.dy = dy;
        this.vx = 0;
        this.vy = 0;
        this.pull = 0;
        this.sx = dx;
        this.sy = dy;
        this.x = dx;
        this.y = dy;
        this.randomize();
    }
    step(vx, vy) {
        this.vx += vx * .1;
        this.vy += vy * .1;
        let dx = this.dx - this.x, dy = this.dy - this.y;
        this.x = this.dx - mmax(-10, mmin(10, dx));
        this.y = this.dy - mmax(-10, mmin(10, dy));
        this.vx = (this.vx + (dx - 2 * this.vx) * this.pull * .3) * .1;
        this.vy = (this.vy + (dy - 2 * this.vy) * this.pull * .3) * .1;
        this.x += this.vx;
        this.y += this.vy;
    }
    drawMe(ctx) {
    }
    randomize() {
        this.dx = this.sx + Math.random() * 10 - 5;
        this.dy = this.sy + Math.random() * 10 - 5;
        this.pull = Math.random() * .1 + .3;
    }
}
class Eye extends Follower {
    constructor(x, y, tp) {
        super(x, y);
        this.x = x;
        this.y = y;
        this.tp = tp;
        this.irdx = 20;
        this.irdy = 20;
    }
    drawMe(ctx) {
        ctx.drawImage(eyes[this.tp], this.x, this.y);
        drawCircle(ctx, this.x + this.irdx, this.y + this.irdy, 3, '#000000');
    }
    randomizeIris() {
        this.irdx = 20 + Math.random() * 4 - 2;
        this.irdy = 20 + Math.random() * 4 - 2;
    }
    lookAt(dx, dy) {
        this.irdx = 20 + mmax(-60, mmin(60, dx)) / 60 * 5;
        this.irdy = 22 + mmax(-60, mmin(60, dy)) / 60 * 4;
    }
}
class Mouth extends Follower {
    constructor() {
        super(...arguments);
        this.tp = 0;
    }
    drawMe(ctx) {
        ctx.drawImage(mouths[this.tp], this.x, this.y);
    }
}
let mthsz = 7;
let mouths = [];
for (let ii = 0; ii < 5; ii++) {
    let can = document.createElement('canvas');
    can.width = 40;
    can.height = 40;
    let ctx = can.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#444444';
    ctx.lineWidth = 3;
    switch (ii) {
        case 0:
            ctx.moveTo(20 - mthsz, 20);
            ctx.lineTo(20 + mthsz, 20);
            break;
        case 1:
            ctx.arc(20, 20, mthsz, .2, 3);
            break;
        case 2:
            ctx.arc(20, 20, mthsz, -3, -.2);
            break;
        case 3:
            ctx.arc(20, 20, mthsz * 1, 0, 6.28);
            break;
        case 4:
            ctx.arc(20, 20, mthsz * .3, 0, 6.28);
            break;
    }
    ctx.stroke();
    // ctx.fill();
    mouths.push(can);
}
let eyesz = 7;
let eyes = [];
for (let ii = 0; ii < 5; ii++) {
    let can = document.createElement('canvas');
    can.width = 40;
    can.height = 40;
    let ctx = can.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 5;
    switch (ii) {
        case 0:
            ctx.arc(20, 20, eyesz, -.5, 3.64);
            ctx.closePath();
            break;
        case 1:
            ctx.arc(20, 20, eyesz, 0, 6.28);
            break;
        case 2:
            ctx.arc(20, 20, eyesz, -3.64, .5);
            ctx.closePath();
            break;
    }
    ctx.stroke();
    ctx.fill();
    eyes.push(can);
}
function getRndClr() {
    return toClr(getRndClrN());
    function getRndClrN() {
        var n = ~~(Math.random() * 0xffffff);
        return n;
    }
    function toClr(n) {
        var res = (~~n).toString(16);
        while (res.length < 6)
            res = "0" + res;
        return "#" + res;
    }
}
export class Player extends Face {
    constructor(x, y, vx, vy, rad, mass) {
        super(x, y, vx, vy, rad, mass);
        this.control = { w: 0, a: 0, s: 0, d: 0 };
        this.color = '#aa6666';
    }
    step() {
        let pow = (this.control.w + this.control.a + this.control.s + this.control.d > 1) ? .14 * 1.5 : .2 * 1.5;
        this.fx += this.control.d * pow - this.control.a * pow;
        this.fy += this.control.s * pow - this.control.w * pow;
        super.step();
        // console.log('pl '+this.room.crdX+' '+this.room.crdY);
    }
    setRoom(ro) {
        this.room = ro;
        setCentralRoom(ro.crdX, ro.crdY);
        // setCam(camx)
        // camx
    }
    jumpCoord(dx, dy) {
        super.jumpCoord(dx, dy);
        setCam(camx + dx, camy + dy);
    }
}
export class SmartFace extends Face {
    constructor({ x = 0, y = 0, vx = 0, vy = 0, rad, mass = rad * rad * .01, eyeN = 1, color = getRndClr() }) {
        super(x, y, vx, vy, rad, mass, eyeN);
        this.tasks = [];
        this.excitement = 0;
        this.commonTasks = {
            goto: { nm: 'goto', prop: { tx: 0, ty: 0, tm: 0 }, cond: (p) => { if (p.tm++ >= 10)
                    return 0; if (dist2(this.x - p.tx, this.y - p.ty) < 100)
                    return 0;
                else
                    return 20; },
                step: (p) => {
                    let dx = p.tx - this.x + this.room.position.x, dy = p.ty - this.y + this.room.position.y;
                    this.vx = (this.vx + (dx - 2 * this.vx) * .003) * .5;
                    this.vy = (this.vy + (dy - 2 * this.vy) * .003) * .5;
                    //  this.vx-=(this.x--this.vx*20.75)*.001;this.vy-=(this.y-p.ty-this.vy*20.75)*.001;
                }, init: (tx, ty) => { return { tx, ty, tm: 0 }; } },
            idle: { nm: 'idle', prop: {}, cond: (p) => { return 0; },
                step: (p) => { }, init: () => { this.addTask(this.commonTasks.goto, [roomw * Math.random(), roomh * Math.random()]); } },
        };
        this.color = color;
    }
    step() {
        super.step();
        if (this.tasks.length) {
            if (--this.tasks[0].time < 0) {
                this.tasks[0].time = this.tasks[0].ts.cond(this.tasks[0].p);
                if (this.tasks[0].time <= 0) {
                    this.tasks.shift();
                }
            }
            else {
                this.tasks[0].ts.step(this.tasks[0].p);
            }
        }
        else
            this.reactTo('idle', null);
    }
    addTask(ts, args = []) {
        this.tasks.push({ ts: ts, p: ts.init.apply(this, args), time: 1 });
    }
    reactTo(tp, oth) {
        switch (tp) {
            case 'idle':
                this.addTask(this.commonTasks.idle);
                break;
            // case '': break;
        }
    }
    defaultEmo() {
        this.mouth.tp = 0;
        this.eyes.forEach(e => e.tp = 0);
    }
}
export class Room {
    constructor(w, h, crdX, crdY) {
        this.w = w;
        this.h = h;
        this.crdX = crdX;
        this.crdY = crdY;
        this.objects = [];
        this.walls = [];
        this.active = false;
    }
    step() {
        // for(let o of this.objects)o.step();
        let i = 0, o;
        while (i < this.objects.length) {
            o = this.objects[i];
            if (o.x > this.w + this.position.x)
                this.moveObjTo(o, 1);
            else if (o.x < this.position.x)
                this.moveObjTo(o, 3);
            else if (o.y > this.h + this.position.y)
                this.moveObjTo(o, 2);
            else if (o.y < this.position.y)
                this.moveObjTo(o, 0);
            else
                i++;
        }
    }
    // drawAsCentral(ctx:CanvasRenderingContext2D, camx:number, camy:number){
    //   this.draw(ctx,camx,camy);
    // }
    draw(ctx) {
        // for(let o of this.objects){
        //   o.drawMe(ctx);
        // }
        // ctx.translate(+this.position.x,+this.position.y);
        ctx.beginPath();
        ctx.lineWidth = 5;
        for (let w of this.walls) {
            if (w.color)
                ctx.strokeStyle = w.color;
            ctx.moveTo(w.x1, w.y1);
            ctx.lineTo(w.x2, w.y2);
        }
        ctx.stroke();
        // ctx.translate(-this.position.x,-this.position.y);
    }
    activate(posx, posy) {
        this.active = true;
        for (let o of this.objects) {
            o.x += posx;
            o.y += posy;
            // o.jumpCoord(posx,posy);
            o.activate();
        }
        this.walls.forEach(w => {
            w.x1 += posx;
            w.x2 += posx;
            w.y1 += posy;
            w.y2 += posy;
            colliderMain.addObj(w, 1, true);
        });
        this.position = { x: posx, y: posy };
    }
    // changePos(posx:number,posy:number){
    //   let dx=posx-this.position.x,dy=posy-this.position.y;
    //   for(let o of this.objects){
    //     o.x+=dx;
    //     o.y+=dy;
    //   }
    //   this.position.x=posx;
    //   this.position.y=posy;
    // }
    deactivate() {
        this.active = false;
        for (let o of this.objects) {
            o.x -= this.position.x;
            o.y -= this.position.y;
            // o.jumpCoord(-this.position.x,-this.position.y);
            o.deactivate();
        }
        this.walls.forEach(w => {
            w.x1 -= this.position.x;
            w.x2 -= this.position.x;
            w.y1 -= this.position.y;
            w.y2 -= this.position.y;
            colliderMain.delObj({ obj: w });
        });
        this.position = null;
    }
    addObj(obj) {
        this.objects.push(obj);
        arrSortOne(this.objects, o => o.rad);
        if (this.position) {
            obj.x += this.position.x;
            obj.y += this.position.y;
        }
        if (obj.room)
            console.log('Error room of obj');
        if (this.active)
            obj.activate();
        obj.setRoom(this);
    }
    delObj(obj) {
        let ind = this.objects.indexOf(obj);
        if (ind >= 0)
            this.objects.splice(ind, 1);
        else
            console.log('Error obj room');
        if (this.position) {
            obj.x -= this.position.x;
            obj.y -= this.position.y;
        }
        obj.room = null;
        if (this.active)
            obj.deactivate();
    }
    addWall(wa) {
        colliderMain.addObj(wa, 1, true);
        this.walls.push(wa);
        if (this.position) {
            wa.x1 += this.position.x;
            wa.y1 += this.position.y;
            wa.x2 += this.position.x;
            wa.y2 += this.position.y;
        }
    }
    moveObjTo(obj, dir) {
        this.delObj(obj);
        switch (dir) {
            case 2:
                obj.jumpCoord(0, -this.h);
                break;
            case 3:
                obj.jumpCoord(+this.w, 0);
                break;
            case 1:
                obj.jumpCoord(-this.w, 0);
                break;
            case 0:
                obj.jumpCoord(0, +this.h);
                break;
        }
        let dj = (2 - dir) % 2, di = (dir - 1) % 2;
        this.checkNeib(this.crdY + di, this.crdX + dj);
        allRooms[this.crdY + di][this.crdX + dj].addObj(obj);
    }
    checkNeib(i, j) {
        if (!allRooms[i] || !allRooms[i][j])
            crtRoom(j, i);
    }
}
export function setCentralRoom(rx, ry) {
    if (actRoom.x != null)
        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++)
                allRooms[actRoom.y + i][actRoom.x + j].deactivate();
    for (let i = -1; i < 2; i++)
        for (let j = -1; j < 2; j++) {
            if (!allRooms[ry + i] || !allRooms[ry + i][rx + j])
                crtRoom(rx + j, ry + i);
            allRooms[ry + i][rx + j].activate((j + 1) * roomw, (i + 1) * roomh);
        }
    actRoom.x = rx;
    actRoom.y = ry;
    Cosmetics.setActRoom(rx, ry);
}
//# sourceMappingURL=objects.js.map