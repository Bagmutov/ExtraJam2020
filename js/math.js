export function pow2(x) { return x * x; }
export function pow2s(x) { return Math.sign(x) * x * x; }
export function mabs(x) { return Math.abs(x); }
export function mmax(x, y) { return Math.max(x, y); }
export function mmin(x, y) { return Math.min(x, y); }
export function sign(x) { return x > 0 ? 1 : x == 0 ? 0 : -1; }
;
export function distTaxi(dx, dy) { return Math.abs(dx) + Math.abs(dy); }
export function distRect(dx, dy) { return Math.max(Math.abs(dx), Math.abs(dy)); }
// export function dist(dx,dy){let dxy2=dx*dx+dy*dy; return (dxy2<700)?root( dxy2*4096 )/64 : root(dxy2)}
export function dist2(dx, dy) { return dx * dx + dy * dy; }
export function dist2Pt(p1, p2) { return pow2(p1.x - p2.x) + pow2(p1.y - p2.y); }
export function dist(dx, dy) { return Math.sqrt(dx * dx + dy * dy); }
export function factorial(n) { return n > 1 ? n * factorial(n - 1) : 1; }
export function ptToLine(px, py, x0, y0, k) {
    let kk = Math.sqrt(k * k + 1), d = (px * k - py + y0 - x0 * k) / kk;
    // console.log('dist '+d+' '+{x:-k/kk,y:1/kk});
    return { d: d, norm: { x: -k / kk, y: 1 / kk } };
}
//add val to sorted vector, if it doesn`t contain such val already.
export function arrSortAdd(vect, val, asc = 1) {
    var i = 0;
    while ((i < vect.length) && (vect[i] * asc < val * asc))
        i++;
    if ((i == vect.length) || !(vect[i] === val))
        vect.splice(i, 0, val);
}
//Quick sort with value function
export function arrSortQuick(arr, fun = ((a) => Number(a))) {
    return arrQSort(arr.map(el => { return { v: el, n: fun(el) }; })).map(el => el.v);
    function arrQSort(origArray) {
        if (origArray.length <= 1) {
            return origArray;
        }
        else {
            var left = [];
            var right = [];
            var newArray = [];
            var pivot = origArray.pop();
            var length = origArray.length;
            for (var i = 0; i < length; i++) {
                if (origArray[i].n <= pivot.n) {
                    left.push(origArray[i]);
                }
                else {
                    right.push(origArray[i]);
                }
            }
            return newArray.concat(arrQSort(left), pivot, arrQSort(right));
        }
    }
}
//begins to ascending sort array, by making one go through. val- assigns val number to each element
export function arrSortOne(arr, val = (v) => v, rev = false) {
    let cp, a, b, l = arr.length - 1, chng = false;
    for (var i = 0; i < l; i++) {
        a = rev ? l - i - 1 : i;
        b = rev ? l - i : i + 1;
        if (val(arr[a]) > val(arr[b])) {
            cp = arr[a];
            arr[a] = arr[b];
            arr[b] = cp;
            chng = true;
        }
    }
    return chng;
}
//removes element from array
export function arrDel(arr, o) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === o) {
            arr.splice(i, 1);
            return true;
        }
    }
    return false;
}
//removes all elements, which satisfy condition
export function arrRemAll(arr, fun, remFun = null) {
    let i = 0;
    while (i < arr.length)
        if (fun(arr[i]))
            if (remFun)
                remFun(arr, i);
            else
                arr.splice(i, 1);
        else
            i++;
}
//finds an index of elem, which satisfies condition
export function arrFind(arr, fun) {
    let i = -1;
    while (++i < arr.length)
        if (fun(arr[i]))
            return i;
    return -1;
}
//finds all elements, which satisfy condition
export function arrFindAll(arr, fun) {
    let i = -1, res = [];
    while (++i < arr.length)
        if (fun(arr[i]))
            res.push(arr[i]);
    return res;
}
//finds which el minimizes fun
export function arrFindMin(arr, fun) {
    var d = Infinity, d2, imin;
    for (var i = 0; i < arr.length; i++) {
        // if(arr[i]){
        d2 = fun(arr[i]);
        if (d2 < d) {
            imin = i;
            d = d2;
        }
    }
    return (d == Infinity) ? null : { o: arr[imin], i: imin, d: d };
}
export function arrSubArr(arr, indexes) {
    let res = [];
    indexes.forEach(ind => res.push(arr[ind]));
    return res;
}
export function sarrContains(sarr, subsarr) {
    if (subsarr.length > sarr.length)
        return false;
    let j = 0;
    for (let i = 0; i < subsarr.length; i++) {
        while (j < sarr.length && subsarr[i] > sarr[j])
            j++;
        if (j == sarr.length || subsarr[i] != sarr[j])
            return false;
    }
    return true;
}
export function arrEq(arr1, arr2) {
    // if (arr1 === arr2) return true;
    if (arr1 == null || arr2 == null)
        return false;
    if (arr1.length != arr2.length)
        return false;
    for (var i = 0; i < arr1.length; ++i) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
}
//checks if it is a number
export let isNum = (val) => parseFloat(val) === val;
//checks if it an Object or Function
export function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
}
;
//makes a copy of an object with all insides copied as well
export function makeCopy(src) {
    // if the value is a nested object, recursively copy all it's properties
    if (isObject(src)) {
        let target;
        if (Array.isArray(src)) {
            target = [];
            for (let el = 0; el < src["length"]; el++)
                target[el] = makeCopy(src[el]);
        }
        else {
            target = {};
            for (let prop in src)
                if (src.hasOwnProperty(prop))
                    target[prop] = makeCopy(src[prop]);
            return target;
        }
        return target;
    }
    else {
        return src;
    }
}
//creates an array filled with len values
export function arrFill(value, len) {
    var arr = [];
    for (var i = 0; i < len; i++) {
        arr.push(value);
    }
    return arr;
}
export function arrFillNaturals(len) {
    let arr = [];
    for (let i = 0; i < len; i++)
        arr[i] = i;
    return arr;
}
export function arrDelRepeats(arr) {
    let ind = 0, ind2 = 1, el;
    while (ind < arr.length - 1) {
        el = arr[ind];
        ind2 = ind + 1;
        while (ind2 < arr.length)
            if (arr[ind2] == el)
                arr.splice(ind2, 1);
            else
                ind2++;
        ind++;
    }
}
// some plotting code for future
// let rr=(stepN/8)%100/100;
// ctx.beginPath();    
// ctx.strokeStyle = "#000000";
// ctx.fillStyle="#ffffffaa"
// ctx.fillRect(0,0,500,500);
// ctx.strokeRect(0,0,500,500);
// ctx.moveTo(0,250);
// for(var i=0;i<500;i++)
// 	ctx.lineTo(i+5,250-100*((dist(i*rr,i*(1-rr))-distSqrt(i*rr,i*(1-rr)))/(distSqrt(i*rr,i*(1-rr))||1)));
// ctx.stroke();
//I spent some considerable amounts of time, writing this. root1 isn't mine. I checked, it worked faster half a year ago, but now it 
//seems to work slower then Math.sqrt()... DaFUCK #mesosad
// export function roots(x){return (x<0)?-root(-x):root(x);}
// export function root(x){//Returns int. with x>5millions - errors in 100s, else +-5. But step for 10000 is big
// 	if(x<100){
// 		x=x<<4;
// 		return root1(x)>>2;
// 	}if(x>10000){
// 		x=x>>6;
// 		return root1(x)<<3;
// 	}
// 	return root1(x);
// }
// export function root1(x){//fast int sqrt. WORKS ON: [10 - 50000], result +-1 on 'x<12000', +-~30 higher . 
// 		var a,b;	  //This alg is from some paper, dontknowhoww, integer-only, breaks before 50000,
// 		b = x;        // faster 2-10 times, works on floats fine, returning int. 
// 		a = x = 0x3f;	//UPDATE checked again. ITS SLOWERRRR
// 		x = b/x;
// 		a = x = (x+a)>>1;
// 		x = b/x;
// 		a = x = (x+a)>>1;
// 		x = b/x;
// 		x = (x+a)>>1;
// 		return(x); 
// 	}
// export function distInt(dx,dy){return root( dx*dx+dy*dy );} //INTEGERS!
//# sourceMappingURL=math.js.map