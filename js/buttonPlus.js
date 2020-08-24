import { VisualElement, SHAPES, Panel, Button, BUT_GLOB, Slider, RadioGroup, Checkbox } from "./button.js";
import { drawShape, drawRoundRect, drawTextBox } from "./tech.js";
import { arrFindMin, makeCopy, mmax, mmin, arrFill, mabs } from "./math.js";
export function shapeOnButton(el, shape, sx, sy, sc, rot) {
    el.drawAllCanv((self, ctx, ind) => {
        drawRoundRect(ctx, 0, 0, 10, self.w, self.h, self.color.back[ind]);
        drawShape(ctx, self.w, self.h, SHAPES.plus, self.color.fig[ind], sx, sy, sc, rot);
    }, true);
}
export class ScrollPanel extends Panel {
    constructor(inp) {
        super(inp);
        this.hshift = 0;
        this.wshift = 0;
        this.sliderSz = 10;
        this.innerCanv = document.createElement('canvas');
        this.innerCtx = this.innerCanv.getContext('2d');
        if (inp.sliderSz != undefined)
            this.sliderSz = inp.sliderSz;
        this.innerw = this.w;
        this.innerh = this.h;
        this.wslider = new Slider({ par: this, x: 0, h: this.sliderSz, z: -100, horizontal: true, valFun: (v) => {
                this.wshift = v * (this.innerw - this.w);
                this.shiftSliders();
            } });
        this.hslider = new Slider({ par: this, y: 0, w: this.sliderSz, z: -100, horizontal: false, valFun: (v) => {
                this.hshift = v * (this.innerh - this.h);
                this.shiftSliders();
            } });
        this.mswheel = (mx, my, delt) => {
            if (this.hslider.active)
                this.hslider.val -= delt * .1; //console.log(delt);
        };
    }
    getButtonIn(x, y) {
        return super.getButtonIn(x + this.wshift, y + this.hshift);
    }
    getPanelIn(x, y) {
        return super.getPanelIn(x + this.wshift, y + this.hshift);
    }
    shiftSliders() {
        this.wslider.setXYW({ x: -this.wshift, y: this.h - this.sliderSz, w: this.w - this.sliderSz });
        this.hslider.setXYW({ x: this.w - this.sliderSz, y: this.hshift, h: this.h - this.sliderSz });
        // console.log(this.hslider.y+' '+this.hshift+' '+this.hslider.val+' '+this.hslider.scrY);
        for (let ch of this.children) { //kind of placeholder...
            this.setScrX(ch);
            this.setScrY(ch);
        }
    }
    setScrX(ch) {
        ch.scrX = this.scrX + ch.x - this.wshift;
    }
    setScrY(ch) {
        ch.scrY = this.scrY + ch.y - this.hshift;
    }
    draw(ctx) {
        if (this.active) {
            this.innerCtx.beginPath();
            this.innerCtx.fillStyle = this.color.panback;
            this.innerCtx.strokeStyle = this.color.line;
            this.innerCtx.drawImage(this.canv[0], 0, 0);
            this.drawMe.call(this, this.innerCtx);
            // this.innerCtx.clearRect();
            this.innerCtx.translate(-this.wshift, -this.hshift);
            for (var i = this.children.length - 1; i >= 0; i--) {
                var p = this.children[i], px = p.x, py = p.y;
                this.innerCtx.translate(px, py);
                p.draw(this.innerCtx);
                this.innerCtx.translate(-px, -py);
                // if(p==this.hslider || p==this.wslider)continue;
            }
            this.innerCtx.translate(this.wshift, this.hshift);
            ctx.drawImage(this.innerCanv, 0, 0);
        }
    }
    setXYW(inp = {}) {
        super.setXYW(inp);
        if (!this.hslider)
            return;
        this.shiftSliders();
        this.innerCanv.width = this.w;
        this.innerCanv.height = this.h;
        this.checkBoundaries();
        this.wslider.drawAllCanv((self, ctx) => { ctx.fillStyle = this.color.panback; ctx.fillRect(0, 0, self.w, this.sliderSz); }, false);
        this.hslider.drawAllCanv((self, ctx) => { ctx.fillStyle = this.color.panback; ctx.fillRect(0, 0, this.sliderSz, self.h); }, false);
    }
    childMoved(ch) { if (this.children.length > 2)
        this.checkBoundaries(); }
    checkBoundaries() {
        let maxx = -arrFindMin(this.children, (c) => { return -(c.x + c.w); }).d;
        let maxy = -arrFindMin(this.children, (c) => { return -(c.y + c.h); }).d;
        this.innerw = mmax(maxx, this.w);
        this.wslider.active = maxx > this.w;
        this.innerh = mmax(maxy, this.h);
        this.hslider.active = maxy > this.h;
    }
}
export class TabPanel extends Panel {
    constructor(inp) {
        super(inp);
        this.panels = [];
        this.tabbuts = [];
        this.tabRadGr = new RadioGroup();
        this.panSz = 15;
        this.labels = [];
        this.tabpan = new Panel({ par: this, x: 0, y: 0, w: this.w, h: this.panSz, name: 'tabpan' });
        if (inp.labels)
            this.labels = inp.labels;
        if (inp.panSz)
            this.panSz = inp.panSz;
    }
    setXYW(inp = {}) {
        super.setXYW(inp);
        this.tabpan.setXYW({ w: this.w, h: this.panSz, y: 0, x: 0 });
        this.posTabs();
    }
    addChild(ch) {
        super.addChild(ch);
        // if(this.children.length>1)this.addTab(ch,this.labels[this.tabbuts.length] || ch.name);//first one is tabpan
    }
    setTabs(pans, labels = null) {
        let n = pans.length;
        if (!labels)
            labels = arrFill('', n);
        for (let i = 0; i < pans.length; i++)
            this.addTab(pans[i], labels[i]);
        this.choosePanel(0);
        this.tabbuts[0].domsclick(0, 0, false);
    }
    addTab(pan, label) {
        let i = this.tabbuts.length;
        this.panels.push(pan);
        this.tabbuts[i] = (new Checkbox({ par: this.tabpan, name: label }));
        this.tabRadGr.add(this.tabbuts[i]);
        this.tabbuts[i].msclick = (mx, my, rmb) => { this.choosePanel(i); };
        this.posTabs();
    }
    posTabs() {
        for (let i = 0; i < this.tabbuts.length; i++) {
            this.tabbuts[i].setXYW({ x: i * this.w / this.tabbuts.length, y: 0, w: this.w / this.tabbuts.length, h: this.panSz });
            this.tabbuts[i].drawAllCanv((self, ctx, ind) => { drawTextBox(ctx, 0, 0, 3, self.w, self.h, self.name, self.h * .7, { boxclr: self.color.back[ind], corn: [true, true, false, false] }); });
            this.panels[i].setXYW({ x: 0, y: this.panSz, w: this.w, h: this.h - this.panSz });
        }
    }
    choosePanel(ind) {
        for (let pan of this.panels)
            pan.active = false;
        this.panels[ind].active = true;
    }
    childMoved(ch) {
        super.childMoved(ch);
        if (ch != this.tabpan) {
            ch.y = mmax(this.panSz, mmin(ch.y, this.h - ch.h));
            ch.h = mmin(this.h - this.panSz, ch.h);
        }
    }
}
export class ObjectSlider extends Slider {
    constructor(inp) {
        super(inp);
        this.offX = 0;
        this.dragObj = false;
        this.insertpos = 0;
        this.rearrange = true;
        this.msdownpos = null;
        let { objects = [], drawObj = null, horizontal = null, rearrange = null, objSz = 30 } = inp;
        this.objSz = objSz;
        if (horizontal != null)
            this.horizontal = horizontal;
        if (rearrange != null)
            this.rearrange = rearrange;
        if (inp.rearrangeFun)
            this.rearrangeFun = inp.rearrangeFun;
        this.drawObj = (drawObj) ? drawObj : (ctx, x, y, w, h, o, sel) => { ctx.fillStyle = sel ? '#999999' : '#444444'; ctx.fillRect(x, y, w - 1, h - 1); };
        this.objects = objects;
        // this.maxNum=objects.length;
        // this.val=0;
        this.drawMe = function (ctx) {
            if (this.dragObj) {
                // this.drawObj(mainctx,MOUSE.mx-10-this.scrX,MOUSE.my-10-this.scrY,30,30,this.objects[this.pos],true);
                ctx.fillStyle = "#000000";
                if (this.horizontal)
                    ctx.fillRect(this.insertpos * this.objSz - this.offX, 0, 2, this.h);
                else
                    ctx.fillRect(0, this.insertpos * this.objSz - this.offX, this.w, 2);
            }
        };
        this.mswheel = function (x, y, d) { this.offX = mmax(0, mmin(this.objects.length * this.objSz - ((this.horizontal) ? this.w : this.h), this.offX - d * 20)); this.drawCanv(); };
        this._msdown = function (x, y, rmb) {
            this.state = 2;
            if (this.objects.length == 0)
                return;
            // console.log('msdown');
            this.val = ((this.horizontal ? x : y) + this.offX) / (this.objSz) / this.objects.length;
            this.msdownpos = this.pos;
            if (this.msdown)
                this.msdown(x, y, rmb);
        };
        this._msmove = function (x, y, rmb) {
            if (this.objects.length == 0)
                return;
            let xy = this.horizontal ? x : y, yx = this.horizontal ? y : x, wh = this.horizontal ? this.w : this.h, hw = this.horizontal ? this.h : this.w;
            if (!this.dragObj) {
                if ((yx > hw || yx < 0) && this.rearrange) {
                    this.pos = this.msdownpos;
                    this.dragObj = true;
                    this.drawCanv();
                }
                else {
                    this.val = (mmax(0, mmin(wh - 1, xy)) + this.offX) / this.objects.length / this.objSz;
                    if (xy < this.objSz)
                        this.offX = mmax(0, mmin(this.objects.length * this.objSz - wh, this.offX - this.objSz * .3));
                    ;
                    if (xy > wh - this.objSz)
                        this.offX = mmax(0, mmin(this.objects.length * this.objSz - wh, this.offX + this.objSz * .3));
                    ;
                    // this.val=(this.horizontal)?(x-this.sideOff)/(this.w-2*this.sideOff):(y-this.sideOff)/(this.h-2*this.sideOff);
                }
            }
            else {
                this.insertpos = mmin(this.objects.length, mmax(0, ~~((xy + this.offX) / this.objSz + .5)));
            }
            if (this.msmove)
                this.msmove(x, y, rmb);
        };
        this._msup = (mx, my, rmb) => {
            this.state = 0;
            if (this.objects.length == 0)
                return;
            if (this.dragObj) {
                this.dragObj = false;
                if (this.insertpos > this.pos)
                    this.insertpos--;
                let el = this.objects.splice(this.pos, 1);
                this.objects.splice(this.insertpos, 0, el[0]);
                let oldpos = this.pos;
                this.pos = this.insertpos;
                if (this.rearrangeFun)
                    this.rearrangeFun(oldpos, this.insertpos, this.selObj);
                this.drawCanv();
            }
            if (this.msup)
                this.msup(mx, my, rmb);
        };
    }
    set val(v) {
        if (v > 1)
            return;
        this._val = mmax(0, mmin(v, 1)); //console.log(this.pos+' '+this.offX+' '+this.val);
        // if((this.pos-.5)*this.objW<this.targetOffX+this.objW)this.targetOffX=(this.pos-.5)*this.objW;
        // if((this.pos+1.5)*this.objW>this.targetOffX+this.w)this.targetOffX=(this.pos+1.5)*this.objW-this.w;
        this.drawCanv();
        this.valFun(this._val);
    }
    ;
    get val() { return this._val; }
    ;
    get selObj() { return this.objects[this.pos]; }
    get maxNum() { return this.objects.length; }
    set maxNum(v) { } //console.log('empty set of maxNum '+v)}
    setXYW(inp = {}) {
        super.setXYW(inp);
        this.drawCanv();
    }
    drawCanv() {
        this.drawAllCanv((self, ctx, ind) => {
            let beg = ~~(this.offX / this.objSz), xx = this.objSz, yy = 0, offx = this.offX, offy = 0, ww = this.objSz, hh = self.h;
            if (!this.horizontal) {
                xx = 0;
                yy = this.objSz;
                offx = 0;
                offy = this.offX;
                ww = self.w;
                hh = this.objSz;
            }
            for (let i = 0; i < this.objects.length; i++) {
                if (this.pos != i || !this.dragObj)
                    this.drawObj(ctx, (i) * xx - offx, i * yy - offy, ww, hh, this.objects[i], this.pos == i);
            }
        }, false);
    }
    addObject(obj, ind = this.objects.length) {
        this.objects.splice(ind, 0, obj);
        // if(this.objects.length>1)this.pos=this.objects.indexOf(this.selObj);//this doesn't work
        this.drawCanv();
    }
    delObject({ obj = null, ind = null }) {
        if (obj)
            ind = this.objects.indexOf(obj);
        if (ind == null || ind < 0)
            return;
        this.objects.splice(ind, 1);
        if (this.selObj)
            this.pos = this.objects.indexOf(this.selObj);
        this.drawCanv();
    }
    clearObjects() {
        this.objects = [];
        this.drawCanv();
    }
    clickPos(pos, rmb = false) {
        let { xx, yy } = (this.horizontal) ? { xx: this.objSz * (pos + .5) + this.sideOff, yy: this.h / 2 } : { xx: this.w / 2, yy: this.objSz * (pos + .5) + this.sideOff };
        this.domsfullclick(xx, yy, rmb);
    }
    selectObject(obj) {
        let ind = this.objects.indexOf(obj);
        if (ind >= 0)
            this.clickPos(ind, false);
    }
}
export class StringEditor extends Button {
    constructor(inp) {
        super(inp);
        this.chars = [];
        this.savedChars = [];
        this.letW = 7;
        this.letH = 13;
        this.lpos = ~~(this.chars.length / 2);
        this.offsetX = 0;
        this.selected = false;
        this.enterFun = null;
        this._enterFun = (s) => { if (this.enterFun)
            this.enterFun(s); };
        this.escFun = null;
        this._escFun = () => { if (this.escFun)
            this.escFun(); };
        if (inp.enterFun)
            this.enterFun = inp.enterFun;
        this.canvN = 1;
        this.crtAllCanv();
        this.msdown = (mx, my, rmb) => {
            if (!this.selected) {
                this.selected = true;
            }
            this.lpos2 = this.lpos = Math.round(mmax(0, mmin(this.chars.length, (mx - this.offsetX) / this.letW)));
            this.fillCanvases();
        };
        this.msmove = (mx, my, rmb) => {
            this.lpos2 = Math.round(mmax(0, mmin(this.chars.length, (mx - this.offsetX) / this.letW)));
            // console.log(this.offsetX+this.lpos2*this.letW);
            if (this.offsetX + this.lpos2 * this.letW < 0)
                this.offsetX += this.letW;
            this.fillCanvases();
            // console.log(mabs(this.lpos2-this.lpos));
        };
        // this.msdouble=()=>{this.setLine('');}
        this.fillCanvases();
        this.drawMe = (ctx) => {
            if (BUT_GLOB.keybFocusBut == this) {
                if (~~(BUT_GLOB.stepN / 50) % 2 == 0)
                    ctx.fillRect(this.offsetX + this.lpos * this.letW - 2, 0, 2, this.letH + 3);
            }
        };
        this.kbdown = (e) => {
            let key = e.key;
            console.log('Key Input: ' + (key));
            if (key == '[' || key == '{')
                key = '(';
            if (key == ']' || key == '}')
                key = ')';
            if (key.length == 1 && (key >= 'a' && key <= 'z' || key >= 'A' && key <= 'Z' || key >= '0' && key <= '9' || ['(', ')', '[', ']', '+', '*', '-', '/', '.', ' ', '~', '<', '>', '=', '_'].indexOf(key) >= 0)) {
                this.chars.splice(mmin(this.lpos, this.lpos2), mabs(this.lpos2 - this.lpos), key);
                this.lpos = mmin(this.lpos, this.lpos2) + 1;
                this.lpos2 = this.lpos;
            }
            else if (key == 'Backspace' && this.lpos > 0 || key == 'Delete' && this.lpos < this.chars.length) {
                if (this.lpos == this.lpos2) {
                    let shft = ((key == 'Delete') ? 0 : 1);
                    this.chars.splice(this.lpos - shft, 1);
                    this.lpos2 = this.lpos -= shft;
                }
                else {
                    this.chars.splice(mmin(this.lpos, this.lpos2), mabs(this.lpos2 - this.lpos));
                    this.lpos2 = this.lpos = mmin(this.lpos, this.lpos2);
                }
            }
            else
                switch (key) {
                    case 'ArrowRight':
                        this.lpos2 = this.lpos = mmin(this.chars.length, mmax(this.lpos, this.lpos2) + (this.lpos == this.lpos2 ? 1 : 0));
                        break;
                    case 'ArrowLeft':
                        this.lpos2 = this.lpos = mmax(0, mmin(this.lpos, this.lpos2) - (this.lpos == this.lpos2 ? 1 : 0));
                        break;
                    case 'Escape':
                        this.chars = makeCopy(this.savedChars);
                        this.lpos = ~~(this.chars.length / 2);
                        BUT_GLOB.keybFocusBut = null;
                        this.doescFun();
                        break;
                    case 'Enter':
                        this.savedChars = makeCopy(this.chars);
                        // this.lpos=~~(this.chars.length/2);
                        this.lpos2 = this.lpos;
                        BUT_GLOB.keybFocusBut = null;
                        // this.expr=stringToExpr(this.chars.join(''));
                        // if(this.expr)
                        // 	console.log('answer: '+evalExpression(this.expr));
                        this.doenterFun(this.line);
                        break;
                }
            this.fillCanvases();
        };
        if (inp.initStr)
            this.setLine(inp.initStr);
    }
    get line() { return this.chars.join(''); }
    get doenterFun() { return this._enterFun; }
    ;
    get doescFun() { return this._escFun; }
    ;
    loseKbFocus() {
        console.log(this.selected);
        if (this.selected) {
            this.selected = false;
            this.doenterFun(this.line);
        }
    }
    setLine(s) {
        this.savedChars = makeCopy(this.chars);
        this.chars = s.split('');
        this.lpos = ~~(s.length);
        this.fillCanvases();
    }
    selectAll() {
        this.lpos = 0;
        this.lpos2 = this.chars.length;
        this.fillCanvases();
    }
    setXYW(inp = {}) {
        super.setXYW(inp);
        this.offsetX = this.w / 2;
        this.fillCanvases();
    }
    fillCanvases() {
        let border = this.w * .1; //-2*border
        if (this.w > this.chars.length * this.letW)
            this.offsetX = (this.w - this.chars.length * this.letW) / 2;
        else if (this.lpos2 * this.letW + this.offsetX > this.w - border)
            this.offsetX -= this.letW; //this.w-(this.lpos*this.letW+this.offsetX)-border;
        else if (this.lpos2 * this.letW + this.offsetX < border || this.chars.length * this.letW + this.offsetX < this.w - border - this.letW)
            this.offsetX += this.letW; //(this.lpos*this.letW+this.offsetX)-border;
        this.drawAllCanv((self, ctx, ind) => {
            ctx.strokeStyle = "black";
            ctx.fillStyle = "white"; //(Math.random()>.5)?:"blue";
            ctx.fillRect(0, 0, self.w, self.h);
            ctx.fillStyle = "#aaaaff"; //(Math.random()>.5)?:"blue";
            ctx.fillRect(this.offsetX + mmin(this.lpos, this.lpos2) * this.letW, 0, this.letW * mabs(this.lpos - this.lpos2), self.h);
            ctx.strokeRect(0, 0, self.w, self.h);
            ctx.fillStyle = "black"; //self.color.text;
            ctx.font = this.letH + "px sans-serif";
            for (let i = 0; i < this.chars.length; i++)
                ctx.fillText(this.chars[i], this.offsetX + this.letW * i, this.letH);
        }, false);
    }
}
export class Namer extends StringEditor {
    constructor() {
        super({ par: BUT_GLOB.rootPanel });
        this.active = false;
        this._enterFun = (s) => { if (this.enterFun)
            this.enterFun(s); this.active = false; };
        this.setXYW({ z: -100 });
        this._escFun = () => { this.active = false; this.enterFun = null; };
    }
    static createNamer() {
        this.NAMER = new Namer();
    }
    static callNamer(scrX, scrY, w, h, enterFun, strtLine = '') {
        this.NAMER.setXYW({ x: scrX, y: scrY, w, h });
        this.NAMER.enterFun = enterFun;
        this.NAMER.active = true;
        this.NAMER.domsfullclick();
        BUT_GLOB.setKeybFocus(this.NAMER);
        this.NAMER.setLine(strtLine);
        this.NAMER.selectAll();
    }
}
// export class PanelLayout{
//     static panelSetChSize(pan:Panel, perc:number, vertical:boolean){
//         let inp=(vertical)?{h:pan.h*perc}:{w:pan.w*perc};
//         for(let ch of pan.children)
//             ch.setXYW(inp);
//     }
//     static panelSetButSize(pan:Panel, size:number, vertical:boolean){
//         let inp=(vertical)?{h:size}:{w:size};
//         for(let ch of pan.children)
//             if(ch instanceof Button)ch.setXYW(inp);
//     }
//     static panelSqueezeCh(pan:Panel, vertical:boolean){
//         let coord=(vertical)?"y":"x",dim=vertical?"h":"w", sum=0, prevc=0;
//         for(let ch of pan.children)sum+=ch[dim];
//         for(let ch of pan.children){
//             ch[dim]=pan[dim]*ch[dim]/sum;
//             ch[coord]=prevc;
//             prevc+=ch[dim];
//         }
//     }
// }
export function panelSqueezeLayout(pan, lout, styles = [{ el: null }]) {
    lout = setStyles(lout, styles);
    layoutSqueeze(lout, pan.w, 'x', 0);
    if (!Array.isArray(lout))
        layoutSqueeze(lout, pan.h, 'y', 0);
    else
        lout.forEach((el) => layoutSqueeze(el, pan.h, 'y', 0));
    function setStyles(lout, styles) {
        if (Array.isArray(lout))
            for (let i in lout)
                lout[i] = setStyles(lout[i], styles);
        else if (lout.style != undefined) {
            let ll = makeCopy(styles[lout.style]);
            ll.el = lout.el;
            lout = ll;
        }
        else if (lout instanceof VisualElement) {
            let ll = makeCopy(styles[0]);
            ll.el = lout;
            lout = ll;
        }
        return lout;
    }
}
let xytowh = { x: 'w', y: 'h' };
function layoutSqueeze(lout, sz, dim = 'x', coord = 0) {
    setFix(lout);
    let realsz = getSz(lout, dim);
    if (!Array.isArray(lout)) {
        stretch(lout, dim, sz / realsz, coord);
    }
    else
        for (let el1 of lout)
            if (!Array.isArray(el1)) {
                stretch(el1, dim, sz / realsz, coord);
                coord += el1.el[xytowh[dim]];
            }
            else {
                let max = -arrFindMin(el1, (e) => (-getSz(e, dim))).d, elsz = max / realsz * sz;
                (el1).forEach((el2) => { layoutSqueeze(el2, elsz, dim, coord); });
                coord += elsz;
            }
    function setFix(lout) {
        if (Array.isArray(lout))
            lout.forEach((el) => setFix(el));
        else if (lout['fix' + dim] != undefined) {
            let inp = {};
            inp[xytowh[dim]] = lout['fix' + dim];
            lout.el.setXYW(inp);
        }
    }
}
function getSz(lout, dim) {
    let sum = 0, maxo;
    if (!Array.isArray(lout))
        return (lout.el[xytowh[dim]]);
    else
        for (let el1 of lout)
            if (!Array.isArray(el1)) {
                sum += (el1.el[xytowh[dim]]);
            } //if(el1['fix'+dim]==undefined)
            else {
                maxo = arrFindMin(el1, (e) => (-getSz(e, dim)));
                el1.forEach((el2, i) => {
                    if (i == maxo.i)
                        return;
                    if (!Array.isArray(el2)) {
                        stretch(el2, dim, -maxo.d / el2.el[xytowh[dim]], el2.el[dim]);
                    }
                    else
                        layoutSqueeze(el2, -maxo.d, dim);
                });
                sum += -maxo.d;
            }
    return sum;
}
function stretch(lel, dim, perc, coord) {
    let inp = {};
    if (lel['stretch' + dim])
        inp[xytowh[dim]] = lel.el[xytowh[dim]] * perc;
    inp[dim] = coord;
    lel.el.setXYW(inp);
}
//# sourceMappingURL=buttonPlus.js.map