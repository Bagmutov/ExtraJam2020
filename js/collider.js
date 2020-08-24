//This file contains evrth to check collisions and react to them
import { arrSortAdd, mmin, mmax, dist, arrDel, mabs, pow2, sign, arrFind } from "./math.js";
//This class is instanciated, when you need to track collisions within a group of any objs.
//It have its own collision grid, its own lists of diff-ly shaped objects and funcs to check collisions of objs w different shapes.
class Collider {
    constructor(gridW, //number of cells horizontally
    gridH, //-||- vertically
    cellS, //size of cells in pixels. Cells are squares
    //this is the list of functions, which used to put objects on grid. each func - to corresponding shapeType.
    putters, //its length - number of shapes in Collider - shapeN
    //next is a matrix of functions, used to return the dist btw objs. Its shapeN by shapeN
    collCheckers) {
        this.gridW = gridW;
        this.gridH = gridH;
        this.cellS = cellS;
        this.putters = putters;
        this.collCheckers = collCheckers;
        //Lists of all objects in Collider
        this.objList = [];
        this.objStatList = [];
        this.gridList = Collider.clearGrid(this.gridW * this.gridH);
        this.gridStatList = Collider.clearGrid(this.gridW * this.gridH);
    }
    //adds object to this Collider
    addObj(obj, shapeType, stat = false) {
        let newo = new ColliderObj(obj, -1, shapeType, [], stat ? this.objStatList : this.objList, stat ? this.gridStatList : this.gridList, stat);
        newo.ind = newo.lst.length;
        newo.lst.push(newo);
        this.putOnGrid(newo);
        return newo;
    }
    delObj({ obj = null, cobj = null }) {
        if (!cobj) {
            let ind1 = arrFind(this.objStatList, o => o.obj == obj), ind2 = arrFind(this.objList, o => o.obj == obj);
            cobj = ind1 >= 0 ? this.objStatList[ind1] : ind2 >= 0 ? this.objList[ind2] : null;
        }
        cobj.lst.splice(cobj.ind, 1);
        cobj.lst.forEach((o, i) => o.ind = i);
        cobj.remFrGrid();
        return true;
    }
    delShape(shape) {
        let ind = 0;
        while (ind < this.objList.length)
            if (this.objList[ind].shape == shape)
                this.delObj({ cobj: this.objList[ind] });
            else
                ind++;
        ind = 0;
        while (ind < this.objStatList.length)
            if (this.objStatList[ind].shape == shape)
                this.delObj({ cobj: this.objStatList[ind] });
            else
                ind++;
    }
    //adds obj to its grid list, using putter for its shape
    putOnGrid(obj) {
        // first - remove from grid
        obj.remFrGrid();
        //then - put it on grid with putter, that corresponds to its shape
        this.putters[obj.shape].call(this, obj);
    }
    //puts on grid all non-static objects
    dynPutOnGrid() {
        for (let i = 0; i < this.objList.length; i++) {
            this.putOnGrid(this.objList[i]);
        }
    }
    //returns a list off all objects, w collide with obj, sorted by distance. Also distance and cos, sin of vector btw objs.
    getColls(obj, statGr, skipTop = false) {
        let res = [], resd = [], k, collis, toCheck = [];
        for (let cell of obj.cells) {
            let lst = (statGr) ? this.gridStatList[cell] : this.gridList[cell];
            for (let i = 0; i < lst.length; i++)
                if (!skipTop || lst[i].ind > obj.ind)
                    arrSortAdd(toCheck, lst[i].ind);
        }
        let objLst = (statGr) ? this.objStatList : this.objList;
        for (let i of toCheck) {
            let colo = objLst[i];
            collis = this.collCheckers[obj.shape][colo.shape]
                .call(this, obj.obj, colo.obj);
            if (collis.d < 0) {
                k = 0;
                while (k < resd.length && resd[k].d < collis.d)
                    k++;
                resd.splice(k, 0, collis);
                res.splice(k, 0, colo);
            }
        }
        return { objs: res, cols: resd };
    }
    //checks collision and just moves objects out of each other
    unintersect(obj1, obj2, colTupl) {
        if (obj1.stat)
            throw new Error('give static object as second argument obj2!');
        if (this.collCheckers[obj1.shape][obj2.shape].call(this, obj1.obj, obj2.obj).d < 0)
            if (obj2.stat)
                hardPushObj(obj1.obj, colTupl.sin, -colTupl.cos, colTupl.d);
            else {
                hardPushObj(obj1.obj, colTupl.cos, colTupl.sin, colTupl.d / 2);
                hardPushObj(obj2.obj, colTupl.cos, colTupl.sin, -colTupl.d / 2);
            }
        //just moves obj along by a dist d
        function hardPushObj(obj, cos, sin, d) {
            d += .1 * sign(d);
            obj.x += cos * (d);
            obj.y += sin * (d);
            // console.log('shifting intersecting object by '+d);
        }
    }
    //just creates clear gridList
    static clearGrid(gHW) {
        let res = new Array();
        for (let i = 0; i < gHW; i++)
            res[i] = new Array();
        return res;
    }
    //draws grid and stuff
    debugDrawGrid(ctx) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#aaaaaa";
        var ij;
        for (var j = 0; j < this.gridH; j++) {
            for (var i = 1; i <= this.gridW; i++) {
                ctx.moveTo(this.cellS * i, this.cellS * j);
                ctx.lineTo(this.cellS * i, this.cellS * (j + 1));
                ctx.lineTo(this.cellS * (i - 1), this.cellS * (j + 1));
                ij = i - 1 + (j) * this.gridW;
                for (var k = 0; k < this.gridList[ij].length; k++) {
                    let obj = this.gridList[ij][k];
                    ctx.fillStyle = obj.obj.color;
                    ctx.fillRect(this.cellS * i - 10 * k - 10, this.cellS * (j + 1) - 10, 10, 10);
                }
                for (var k = 0; k < this.gridStatList[ij].length; k++) {
                    let obj = this.gridStatList[ij][k];
                    ctx.fillStyle = obj.obj.color;
                    ctx.fillRect(this.cellS * i - 10 * k - 10, this.cellS * (j), 10, 10);
                }
            }
        }
        ctx.stroke();
    }
    //changes speeds of objs, according to masses..
    //NOTE It is prob possible to collide using collideWall
    static collide(obj1, obj2, cosa, sina) {
        // let xDif:number = obj1.x - obj2.x, yDif:number = obj1.y - obj2.y;
        // let d:number = Math.sqrt(xDif*xDif + yDif*yDif); //Distance btw them
        // let cosa:number, sina:number; //sin and cos of angle btw OX and line through centers of objs
        // cosa = xDif / d;
        // sina = yDif / d;
        if (obj1 === obj2)
            throw new Error("SCHIZO tried to collide with himself!");
        let ux1, ux2, uy1, uy2; //Carthesian coords in rotated axes
        ux1 = obj1.vx * cosa + obj1.vy * sina;
        ux2 = obj2.vx * cosa + obj2.vy * sina;
        uy1 = -obj1.vx * sina + obj1.vy * cosa;
        uy2 = -obj2.vx * sina + obj2.vy * cosa;
        let p = 2 * (ux1 - ux2) / (obj1.mass + obj2.mass); //momentum / (mass1*mass2)
        //now lets change rotated carthesian speeds:
        if (ux1 - ux2 >= 0)
            return null; //if they moving toward each other
        ux1 -= p * obj2.mass;
        ux2 += p * obj1.mass;
        obj1.vx = ux1 * cosa - uy1 * sina;
        obj2.vx = ux2 * cosa - uy2 * sina;
        obj1.vy = ux1 * sina + uy1 * cosa;
        obj2.vy = ux2 * sina + uy2 * cosa;
        return p;
    }
    //reverses obj speed relative to wall with cos, sin
    static collideWall(obj, cos, sin, perc = 1) {
        if (cos * cos + sin * sin - 0.9999 > 0.0002)
            throw new Error("Incorrect sin, cos in wall collision! sin:" + sin + " cos:" + cos);
        let ux = obj.vx * cos + obj.vy * sin; //Carthesian coords in rotated axes
        let uy = -obj.vx * sin + obj.vy * cos;
        uy = -uy * perc;
        obj.vx = ux * cos - uy * sin;
        obj.vy = ux * sin + uy * cos;
    }
}
//list of all the putters you'll ever need. Noth'n is ever complete tho
Collider.commonPutters = {
    putRect: function (obj) {
        let o = obj.obj;
        let i1 = ~~mmax(0, mmin(this.gridW - 1, (o.c_x - o.rad) / this.cellS));
        let i2 = ~~mmax(0, mmin(this.gridW - 1, (o.c_x + o.rad) / this.cellS));
        let j1 = ~~mmax(0, mmin(this.gridH - 1, (o.c_y - o.rad) / this.cellS));
        let j2 = ~~mmax(0, mmin(this.gridH - 1, (o.c_y + o.rad) / this.cellS));
        for (let j = j1; j <= j2; j++)
            for (let i = i1 + this.gridW * j; i <= i2 + this.gridW * j; i++)
                obj.addToGrid(i);
    },
    putRectMov: function (obj) {
        let o = obj.obj;
        let i1 = ~~mmax(0, mmin(this.gridW - 1, mmin((o.c_x - o.rad) / this.cellS, (o.x - o.rad) / this.cellS)));
        let i2 = ~~mmax(0, mmin(this.gridW - 1, mmax((o.c_x + o.rad) / this.cellS, (o.x - o.rad) / this.cellS)));
        let j1 = ~~mmax(0, mmin(this.gridH - 1, mmin((o.c_y - o.rad) / this.cellS, (o.y - o.rad) / this.cellS)));
        let j2 = ~~mmax(0, mmin(this.gridH - 1, mmax((o.c_y + o.rad) / this.cellS, (o.y - o.rad) / this.cellS)));
        for (let j = j1; j <= j2; j++)
            for (let i = i1 + this.gridW * j; i <= i2 + this.gridW * j; i++)
                obj.addToGrid(i);
    },
    putLine: function (obj) {
        let ln = obj.obj;
        let dirX = (ln.x1 > ln.x2) ? -1 : 1, dirY = (ln.y1 > ln.y2) ? -1 : 1;
        let m = ~~(ln.x1 / this.cellS), n = ~~(ln.y1 / this.cellS);
        let bordX = (m + ((dirX == 1) ? 1 : 0)) * this.cellS, bordY = (n + ((dirY == 1) ? 1 : 0)) * this.cellS;
        let cellN = m + n * this.gridW;
        let k = (ln.y2 - ln.y1) / (ln.x2 - ln.x1);
        if (m >= 0 && n >= 0 && m < this.gridW && n < this.gridH)
            obj.addToGrid(cellN);
        while ((bordX * dirX < ln.x2 * dirX) || (bordY * dirY < ln.y2 * dirY)) {
            if ((bordX - ln.x1) * k * dirY < (bordY - ln.y1) * dirY) {
                bordX += this.cellS * dirX;
                cellN += dirX;
                m += dirX;
            }
            else {
                bordY += this.cellS * dirY;
                cellN += this.gridW * dirY;
                n += dirY;
            }
            if (m >= 0 && n >= 0 && m < this.gridW && n < this.gridH)
                obj.addToGrid(cellN);
        }
    }
};
//list of checkers you can use
Collider.commonCheckers = {
    circToCirc: function (o1, o2) {
        let xd = o1.c_x - o2.c_x, yd = o1.c_y - o2.c_y, dst = dist(xd, yd);
        return { d: dst - o1.rad - o2.rad, cos: xd / dst, sin: yd / dst };
    },
    circToLine: function (obj, ln) {
        // let xx=obj.x+obj.vx, yy=obj.y+obj.vy;
        // let f2:number = xx * ln.cos + yy * ln.sin + ln.offx;
        let f2 = obj.c_x * ln.cos + obj.c_y * ln.sin + ln.offx;
        if (f2 < 0) {
            let xd = obj.c_x - ln.x1, yd = obj.c_y - ln.y1, dst = dist(xd, yd) || .1;
            return { d: dst - obj.rad, sin: -xd / dst, cos: yd / dst };
        }
        else if (f2 > ln.len) {
            let xd = obj.c_x - ln.x2, yd = obj.c_y - ln.y2, dst = dist(xd, yd) || .1;
            return { d: dst - obj.rad, sin: -xd / dst, cos: yd / dst };
        }
        else
            return { d: mabs(-obj.c_x * ln.sin + obj.c_y * ln.cos + ln.offy) - obj.rad, cos: ln.cos, sin: ln.sin };
    },
    circToLine2: function (obj, ln) {
        let h1 = -obj.x * ln.sin + obj.y * ln.cos + ln.offy;
        let h2 = -obj.c_x * ln.sin + obj.c_y * ln.cos + ln.offy;
        if (h1 * h2 > 0)
            return Collider.commonCheckers.circToLine(obj, ln);
        let f1 = obj.x * ln.cos + obj.y * ln.sin + ln.offx;
        let f2 = obj.c_x * ln.cos + obj.c_y * ln.sin + ln.offx;
        if (f1 > 0 && f1 < ln.len || f2 > 0 && f2 < ln.len) {
            return { d: -mabs(h2) - obj.rad, cos: ln.cos, sin: ln.sin };
        }
        if (f2 < 0) {
            let xd = obj.c_x - ln.x1, yd = obj.c_y - ln.y1, dst = dist(xd, yd) || .1;
            return { d: dst - obj.rad, sin: -xd / dst, cos: yd / dst };
        } //then f2 > ln.len !
        let xd = obj.c_x - ln.x2, yd = obj.c_y - ln.y2, dst = dist(xd, yd) || .1;
        return { d: dst - obj.rad, sin: -xd / dst, cos: yd / dst };
    },
    falser: function (o1, o2) {
        return 999;
    }
};
//class, w represents collisions, with distance and cos, sin of line btw objs. if d<0 objs collide.
class Collis {
    constructor(d, sin, cos) {
        this.d = d;
        this.sin = sin;
        this.cos = cos;
    }
}
//objects in Collider are stored in this form:
class ColliderObj {
    constructor(obj, //the object itself
    ind, //index of this inst in its lst
    shape, //number, that associated with this obj's shape
    cells, //list of No. of cells which this obj intersects now.
    lst, //this is objList or objStatList    maybe unnec-ry
    grid, //this is gridList or gridStatList   maybe unnec-ry
    stat //is this obj static?
    ) {
        this.obj = obj;
        this.ind = ind;
        this.shape = shape;
        this.cells = cells;
        this.lst = lst;
        this.grid = grid;
        this.stat = stat;
    }
    addToGrid(ind) {
        arrSortAdd(this.grid[ind], this);
        arrSortAdd(this.cells, ind);
    }
    remFrGrid() {
        for (let i of this.cells)
            arrDel(this.grid[i], this);
        this.cells = [];
    }
}
//class represents line, w some parameters, useful in collision detection, w can be calculated once, at line creation
export class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.len = Math.sqrt(pow2(x2 - x1) + pow2(y2 - y1)); //length of line
        this.cos = (x2 - x1) / this.len; //cos
        this.sin = (y2 - y1) / this.len; //sin
        this.offx = (x1 * (x1 - x2) + y1 * (y1 - y2)) / this.len; //horizontal offset in rotated coord system
        this.offy = (y1 * (x1 - x2) + x1 * (y2 - y1)) / this.len; //vertical -||-
    }
    drawMe(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }
}
export { Collider, Collis, ColliderObj };
//# sourceMappingURL=collider.js.map