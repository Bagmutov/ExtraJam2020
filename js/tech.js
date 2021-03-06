import { isNum, isObject } from "./math.js";
import { BUT_GLOB } from "./button.js";
function resize(canvas, { initButGlob = false, wscale = 1, hscale = 1, w = null, h = null } = {}) {
    canvas.width = (w || (window.innerWidth - 1)) * wscale;
    canvas.height = (h || (window.innerHeight - 5)) * hscale;
    if (initButGlob)
        BUT_GLOB.init(canvas.width, canvas.height);
}
function isRightMB(e) {
    var isRightMB;
    e = e || window.event;
    if ("which" in e) // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3;
    else if ("button" in e) // IE, Opera 
        isRightMB = e.button == 2;
    return isRightMB;
}
function testTime(f, N, arg) {
    let tt = (new Date()).getTime();
    for (var k = 0; k < N; k++)
        f(arg);
    return ((new Date()).getTime() - tt);
}
// type BoxSize={x:number, y:number, w?:number,h?:number,cr?:number};
export function drawCircle(ctx, x, y, r, clr = null, stroke = 0, ang = [0, 6.29]) {
    if (clr)
        ctx.fillStyle = ctx.strokeStyle = clr;
    ctx.beginPath();
    ctx.arc(x, y, r, ang[0], ang[1]);
    ctx.lineWidth = stroke;
    if (stroke > 0)
        ctx.stroke();
    else
        ctx.fill();
}
;
export function drawLine(ctx, x1, y1, x2, y2, clr = null, lineW = 1) {
    if (clr)
        ctx.strokeStyle = clr;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = lineW;
    ctx.stroke();
}
;
export function drawCross(ctx, x, y, r, clr = null, lineW = 1) {
    if (clr)
        ctx.strokeStyle = clr;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r);
    ctx.lineTo(x, y + r);
    ctx.lineWidth = lineW;
    ctx.stroke();
}
;
export function drawX(ctx, x, y, r, clr = null, lineW = 1) {
    if (clr)
        ctx.strokeStyle = clr;
    ctx.beginPath();
    ctx.moveTo(x - r, y - r);
    ctx.lineTo(x + r, y + r);
    ctx.moveTo(x + r, y - r);
    ctx.lineTo(x - r, y + r);
    ctx.lineWidth = lineW;
    ctx.stroke();
}
;
export function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, clr = null) {
    if (clr)
        ctx.fillStyle = clr;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.fill();
}
;
export function drawRoundRect(ctx, x, y, r, w = ctx.canvas.width, h = ctx.canvas.height, clr = '#000000', corn = [true, true, true, true]) {
    var x1 = x + r, x2 = x + w - r, y1 = y + r, y2 = y + h - r;
    ctx.beginPath();
    if (corn[0])
        ctx.arc(x1, y1, r, 3.14, 4.71);
    else
        ctx.lineTo(x, y);
    if (corn[1])
        ctx.arc(x2, y1, r, 4.71, 6.28);
    else
        ctx.lineTo(x + w, y);
    if (corn[2])
        ctx.arc(x2, y2, r, 0, 1.57);
    else
        ctx.lineTo(x + w, y + h);
    if (corn[3])
        ctx.arc(x1, y2, r, 1.57, 3.14);
    else
        ctx.lineTo(x, y + h);
    if (corn[0])
        ctx.lineTo(x, y1);
    else
        ctx.lineTo(x, y);
    // if(corn[0])ctx.lineTo(x,y1); else ctx.lineTo(x,y);
    ctx.fillStyle = clr;
    ctx.fill();
}
export function drawTextBox(ctx, x, y, r, w = ctx.canvas.width, h = ctx.canvas.height, text = '', fontSize, { boxclr = '#ffffff', textclr = '#000000', off = { x: 0, y: 0 }, corn = undefined }) {
    drawRoundRect(ctx, x, y, r, w, h, boxclr, corn);
    ctx.fillStyle = textclr;
    ctx.font = fontSize + 'px sans-serif'; //-text.length*.05 w*(.53)
    let i = 0;
    if (typeof text == "string")
        ctx.fillText(text, x + r + off.x, y + h / 2 + fontSize * .25 + off.y, w - 2 * r - off.x);
    else
        for (let txt of text)
            ctx.fillText(txt, x + r + off.x, y + r + fontSize * 0.75 + off.y + fontSize * (i++), w - 2 * r - off.x); //
}
//Here all coords should be in percent of figure: in [0..1]. sxy - starting pos, sc - scale
export function drawShape(ctx, w, h, pts, clr = '#000000', sx = 0, sy = 0, sc = 1, rot = 0) {
    let n = pts.length;
    sx *= w;
    sy *= h;
    w = w * sc;
    h = h * sc;
    ctx = ctx;
    ctx.save();
    ctx.beginPath();
    ctx.translate(w / 2 + sx, h / 2 + sy);
    ctx.rotate(rot);
    ctx.translate(-w / 2 - sx, -h / 2 - sy);
    ctx.moveTo(pts[n - 1][0] * w + sx, pts[n - 1][1] * h + sy);
    for (let i = 0; i < n; i++)
        ctx.lineTo(pts[i][0] * w + sx, pts[i][1] * h + sy);
    ctx.fillStyle = clr;
    ctx.fill();
    ctx.restore();
}
export function saveFile(obj, fileName) {
    var a = document.createElement("a");
    let str = (typeof obj == 'string') ? obj : JSON.stringify(obj, null, ' ');
    var file = new Blob([str], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
export function loadJSONChoose(callback) {
    var file, fr;
    if (false) { //typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.");
        return;
    }
    let input = document.createElement('input');
    input.type = 'file';
    input.oninput = function (e) {
        if (!input || !input.files) {
            alert("This browser doesn't seem to support the `files` property of file inputs.");
        }
        else {
            let file = input.files[0];
            fr = new FileReader();
            fr.onload = receivedText;
            fr.readAsText(file);
        }
    };
    input.click();
    return;
    function receivedText(e) {
        let obj = JSON.parse(e.target.result);
        callback(obj);
    }
}
export function loadJSON(filename, callback) {
    loadFile(filename, function (s) { callback(JSON.parse(s)); });
}
export function loadFile(filename, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == 200) {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}
export function cutAllNumbers(obj, tenpow = 1000) {
    for (let pr in obj)
        if (isNum(obj[pr]))
            obj[pr] = ~~(obj[pr] * tenpow) / tenpow;
        else if (isObject(obj[pr]))
            cutAllNumbers(obj[pr]);
}
export class TASK_DELAYER {
    static executeTask(fun, delay, name) {
        this.cancelTasks(name);
        if (this.emptyInds.length) {
            var ind = this.emptyInds.pop();
            this.tasks[ind].name = name;
            this.tasks[ind].status = 1;
        }
        else {
            var ind = this.tasks.length;
            this.tasks.push({ name: name, status: 1 });
        }
        setTimeout(this.delayedExe.bind(this), delay, ind, fun);
    }
    static cancelTasks(name) {
        for (let ts of this.tasks)
            if (ts.name == name)
                ts.status = 0;
    }
    static delayedExe(ind, fun) {
        switch (this.tasks[ind].status) {
            case 1:
                fun();
                break;
        }
        this.emptyInds.push(ind);
    }
}
TASK_DELAYER.tasks = [];
TASK_DELAYER.emptyInds = [];
export { resize, isRightMB, testTime };
//# sourceMappingURL=tech.js.map