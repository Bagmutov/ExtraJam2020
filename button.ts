import { isRightMB, drawCircle, drawLine, drawRoundRect, drawTextBox } from "./tech.js";
import { pow2, mmax, mmin, arrRemAll, arrFind, mabs, dist2, arrSortOne, dist } from "./math.js";

export  const MOUSE = {mx:0, my:0, mouseDown:false};

window.addEventListener('dblclick',mouseDblButton);
window.addEventListener('mousedown',mouseDownButton);
window.addEventListener('mouseup',mouseUpButton);
window.addEventListener('mousemove',mouseMoveButton);
window.addEventListener('keydown',keyDownButton);
window.addEventListener("mousewheel", mouseWheelButton, false);// IE9, Chrome, Safari, Opera
window.addEventListener("DOMMouseScroll", mouseWheelButton, false);// Firefox
// window.addEventListener("dblclick", );

//button state: 0 - mouse out or in&pressed on oth but, 1 - mouse in, unpressed, 2 - mouse in, pressed on this but.

function keyDownButton(e:KeyboardEvent){
	if(BUT_GLOB.keybFocusBut)BUT_GLOB.keybFocusBut.dokbdown(e);
	else
		for(let hk of BUT_GLOB.hotKeys)
			if(hk.k==e.key && hk.b.par.active)hk.b.domsclick(0,0,isRightMB(e));
	// for(let kl of BUT_GLOB.keybListeners)kl.keyPressed(e.key);
}
function mouseDownButton(e){
	MOUSE.mouseDown=true;
	let but = BUT_GLOB.rootPanel.getButtonIn(e.clientX,e.clientY);
	if(but){
		if(but!=BUT_GLOB.keybFocusBut)
			BUT_GLOB.setKeybFocus(but);
		but.domsdown(e.clientX-but.scrX,e.clientY-but.scrY,isRightMB(e));
	}
}
function mouseUpButton(e){
	MOUSE.mouseDown=false;
	let but = BUT_GLOB.rootPanel.getButtonIn(e.clientX,e.clientY), mfb=BUT_GLOB.mouseFocusBut;
	if(mfb)mfb.domsup(e.clientX-mfb.scrX,e.clientY-mfb.scrY,isRightMB(e));
	if(!mfb)return;
	if(but && but==mfb){
		// console.log(but);
		but.domsclick(e.clientX-but.scrX,e.clientY-but.scrY,isRightMB(e));
	}
	// BUT_GLOB.mouseFocusBut=undefined;
}
function mouseMoveButton(e){
	BUT_GLOB.shiftOn=e.shiftKey;
	MOUSE.mx=e.clientX;
	MOUSE.my=e.clientY;
	let but = BUT_GLOB.rootPanel.getButtonIn(e.clientX,e.clientY), mfb=BUT_GLOB.mouseFocusBut;
	if(mfb && (!but || mfb!=but)){
		if(!MOUSE.mouseDown){
			mfb.domsout(e.clientX,e.clientY,isRightMB(e));
			BUT_GLOB.mouseFocusBut = undefined;
		}
		if(mfb.label==BUT_GLOB.readyLabel)
			BUT_GLOB.readyLabel=null;
		if(mfb.label==BUT_GLOB.activeLabel)
			BUT_GLOB.activeLabel=null;
	}
	if(but){
		if(!BUT_GLOB.mouseFocusBut)BUT_GLOB.mouseFocusBut=but;
		but.domsover(e.clientX-but.scrX,e.clientY-but.scrY,isRightMB(e));
		if(but.label && but == mfb)
			but.label.beginTimeout();
		// if(elin.msOverToTop && (!BUT_GLOB.msOverTopDraw || mfb!=BUT_GLOB.msOverTopDraw))BUT_GLOB.msOverTopDraw=b;
	}
	if(mfb && MOUSE.mouseDown){mfb.domsmove(e.clientX-mfb.scrX,e.clientY-mfb.scrY,isRightMB(e));}
}
function mouseWheelButton(e){
	var delta =  (e.wheelDelta/120 || -e.detail/3);
	let el:VisualElement = BUT_GLOB.rootPanel.getButtonIn(e.clientX,e.clientY)
	let pan=BUT_GLOB.rootPanel.getPanelIn(e.clientX,e.clientY);
	if(el)el.mmswheel(e.clientX-el.scrX,e.clientY-el.scrY,delta);
	else pan.mmswheel(e.clientX-pan.scrX,e.clientY-pan.scrY,delta);
	// if(pan)
}
function mouseDblButton(e){
	let but = BUT_GLOB.rootPanel.getButtonIn(e.clientX,e.clientY);
	if(but)
		but.domsdouble(e.clientX-but.scrX,e.clientY-but.scrY,isRightMB(e));
}

//Some methods, specifically for Button.drawMe , as they lack fillStyle & beginPath.
class ButFunc{
	static drawMeRect = function(ctx){
		ctx.moveTo(0,0);
		ctx.lineTo(0+this.w, 0);
		ctx.lineTo(0+this.w, 0+this.h);
		ctx.lineTo(0, 0+this.h);
		ctx.lineTo(0, 0);
		ctx.fill();
	}
	static drawMeCircle = function(ctx){
		ctx.arc(0,0,this.rad,0,6.29);
		ctx.fill();
	}
	static drawMeRoundRect = function(crad:number,ctx){
		var x1=0+crad, x2=0+this.w-crad, y1=0+crad, y2=0+this.h-crad;
		ctx.arc(x1,y1,crad,3.14,4.71);
		ctx.arc(x2,y1,crad,4.71,6.28);
		ctx.arc(x2,y2,crad,0,1.57);
		ctx.arc(x1,y2,crad,1.57,3.14);
		ctx.lineTo(0,y1);
		ctx.fill();
	}
	static drawMeText = function(ctx, text:string, fontSize=10, clr=this.color.text){
		ctx.fillStyle=this.color.text;
		ctx.font = fontSize+'px sans-serif';
		text+='';
		ctx.fillText(text,this.w*(.63-text.length*.2),0+fontSize*1.2);
	}
	static drawMeHSlider = function(ctx){
		ctx.lineWidth=1;
		ctx.moveTo(0+this.sideOff,0+this.h/2);
		ctx.lineTo(0+this.w-this.sideOff, 0+this.h/2);
		ctx.stroke();
		ctx.fillRect(0+this.sideOff+this.val*(this.w-this.sideOff*2)-3,0,6,this.h);
	}
	static drawMeVSlider = function(ctx){
		ctx.lineWidth=1;
		ctx.moveTo(0+this.w/2,0+this.sideOff);
		ctx.lineTo(0+this.w/2, 0+this.h-this.sideOff);
		ctx.stroke();
		ctx.fillRect(0,0+this.sideOff+this.val*(this.h-this.sideOff*2)-3,this.w,6);
	}
	static drawMeNumSlider = function(ctx){
		let r=mmin(this.h/2,this.w/2);
		drawCircle(ctx,this.w/2,this.h/2,r);
		ctx.lineWidth=(this.drawText)?r/4:r*.8;
		ctx.beginPath();
		ctx.arc(this.w/2,this.h/2,r-ctx.lineWidth/2,0,-6.29*this.val,true);
		ctx.stroke();
		if(this.drawText)this.textDrawer.call(this,ctx,r*1.2,this.pos);
	}
	static drawMeListSlider = function(ctx){
		if(this.free){
			this.val=mmax(0,mmin(1,this.valv*this.valmult+this.val));
			this.valv*=.8;
			this.valv-=(this.val*this.maxNum-.5-this.pos)*.01;
		} else {this.valv=(this.val-this.oldval)/this.valmult*.5; this.oldval=this.val;}
		let i=0, j=0,sc,op;
		this.lstTopnow=mmax(0,mmin(this.lstTopnow+(this.state-.5)*30,this.lstTop));
		this.lstBotnow=mmax(0,mmin(this.lstBotnow+(this.state-.5)*30,this.lstBot));
		op =( ~~(this.lstBotnow/this.lstBot*.5*0xff)).toString(16);if(op.length==1)op='0'+op;
		drawRoundRect(ctx,0-BUT_GLOB.crad,0-this.lstTopnow,BUT_GLOB.crad,this.w+BUT_GLOB.crad*2,this.lstBotnow+this.lstTopnow,'#ffffff'+op);
		while(++i*this.h<this.lstBotnow && i+this.pos<this.maxNum){
			sc = (3-i*this.h/this.lstBotnow)/3;
			op =( mmin(0xff,~~((1-i*this.h/this.lstBotnow)/1*0xff*2))).toString(16);if(op.length==1)op='0'+op;
			drawTextBox(ctx,0+this.w*(1-sc)/2,0-(this.val*this.maxNum-this.pos-i-.5)*this.h,BUT_GLOB.crad*sc,this.w*sc,this.h*sc,this.lines[(this.pos+i)],this.fontSize*sc,{boxclr:this.color.back[0]+op,textclr:'#000000'+op});
		}
		while(++j*this.h<this.lstTopnow && this.pos-j>=0){
			sc = (3-j*this.h/this.lstTopnow)/3;
			op =( mmin(0xff,~~((1-j*this.h/this.lstTopnow)/1*0xff*2))).toString(16);if(op.length==1)op='0'+op;
			drawTextBox(ctx,0+this.w*(1-sc)/2,0-(this.val*this.maxNum-this.pos+j-.5)*this.h,BUT_GLOB.crad*sc,this.w*sc,this.h*sc,this.lines[(this.pos-j)],this.fontSize*sc,{boxclr:this.color.back[0]+op,textclr:'#000000'+op});
		}
		drawTextBox(ctx,0,0-(this.val*this.maxNum-this.pos-.5)*this.h,BUT_GLOB.crad,this.w,this.h,this.lines[this.pos],this.fontSize,{boxclr:this.color.back[this.state],textclr:'#000000'});
		// console.log(this.pos);
		
	}
	static drawMeSwitcher = function(ctx){
		let w=this.w/2;
		drawCircle(ctx,0+w,0+w,w);
		ctx.lineWidth=4;
		ctx.beginPath();
		drawCircle(ctx,0+w,0+w,.8*w*(this.pos+.5)/this.posN,this.color.line)
		ctx.stroke();
		// this.textDrawer.call(this,ctx,~~(this.val*100));
	}
	static inMaskRoundRect = function(x:number,y:number,crad:number=BUT_GLOB.crad):boolean{
		x=mabs(x-(this.x+.5*this.w)); y=mabs(y-(this.y+.5*this.h));
		if(x>this.w/2 || y>this.h/2)return false;
		x = x-this.w/2+crad; y = y-this.h/2+crad;
		return !(x>0 && y>0 && dist2(x,y)>pow2(crad));
	};
}
const BUT_CLR:UIClrs={
	panback:"#aaaaaa",
	back:["#888888","#999999","#555555"],
	fig:["#888888","#999999","#555555"],
	line:'#000000',
	shdw:'#000000',
	text:'#000000',
}
export type UIClrs={panback:string;back:string[],fig:string[],shdw:string,line:string,text:string};
type ButInputs = { par: Panel; x?: number; y?: number; w?: number; h?: number; z?: number; msclick?: ClickFun; props?:any;canvN?:number; name?:string;// 
				   val?: number; valFun?: ValFun; drawText?: boolean; maxNum?: number; posN?: number; lines?:string[];
				   lstTop?:number;lstBot?:number;fontSize?:number, valmult?:number, sideOff?:number, limits?:{x1:number,x2:number,y1:number,y2:number}};
export type XYWHZ= { x?: number; y?: number; w?: number; h?: number; z?: number;};

class VisualElement{	//element which must be in hierarchical tree
	// name:string;
	// par:Panel;
	// x:number;y:number;w:number;h:number;z:number;
	props:any={};	//any useful variables
	protected _scrX:number=0;
	protected _scrY:number=0;
	set scrX(v){this._scrX=v;}	get scrX(){return this._scrX}
	set scrY(v){this._scrY=v;}	get scrY(){return this._scrY}
	color:UIClrs=BUT_CLR;
	canv:HTMLCanvasElement[]=[];	//canvases
	// ctx:CanvasRenderingContext2D;
	active:boolean=true;
	
	constructor(
		public name:string='',	//for referencing in code and debug
		public par:Panel,
		public x:number,	//relative to par
		public y:number,
		public w:number,
		public h:number,
		public z:number,	//z-index, relative to siblings
		public canvN:number
	){
		if(par){
			par.addChild(this);
		}else{
			this.scrX=x;
			this.scrY=y;
		}
		// this.setXYW({x,y,w,h,z}) //The problem here with override. It calls new method, which uses not yet initialized vars
		this.crtAllCanv(this.w,this.h);
	}
	crtAllCanv(w=this.w,h=this.h){
		for (let i = 0; i < this.canvN; i++) {
			this.canv[i]=document.createElement('canvas');
			this.canv[i].width=mmax(w,10);
			this.canv[i].height=mmax(h,10);
		}
		for (let i = this.canvN; i < 3; i++)
			this.canv[i]=this.canv[this.canvN-1];
		// this.ctx=this.canv[0].getContext('2d');
	}
	drawAllCanv(drawFun:(self:VisualElement,ctx:CanvasRenderingContext2D,ind:number)=>void, delDrawme=true){
		this.crtAllCanv(this.w,this.h);
		if(delDrawme)this.drawMe=(ctx)=>{};
		for (let i = 0; i < this.canvN; i++){
			this.canv[i].getContext('2d').clearRect(0,0,this.canv[i].width,this.canv[i].height);
			drawFun(this,this.canv[i].getContext('2d'),i);
		}
	}
	draw(ctx:CanvasRenderingContext2D){}
	drawMe:(ctx:CanvasRenderingContext2D)=>void;
	inRect(x:number,y:number):boolean{return (x>this.x && y>this.y && x<this.x+this.w && y<this.y+this.h)}
	initPos(inp:XYWHZ){ this.setXYW(inp); }
	initDraw(clr:UIClrs){}
	initActions(){}// actions initialized after initPos & initDraw
	setXYW({ x = this.x, y = this.y, w = this.w, h = this.h||w, z = undefined}: { x?: number; y?: number; w?: number; h?: number; z?: number;} = {}){
		this.x=x;this.y=y;this.w=w;this.h=h;this.z= (z==undefined)?this.z:z;
		if(this.par){
			this.par.childMoved(this);
			this.par.setScrX(this);
			this.par.setScrY(this);
			if(z!=undefined)
				this.par.sortButtons();
		}
		
	}
	changePar(newpar:Panel){
		let par=this.par;
		this.par.deleteChild(this);
		this.par=newpar;
		newpar.addChild(this);
		this.setXYW({x:this.scrX-newpar.scrX,y:this.scrY-newpar.scrY});
	}
	get mmswheel(){return this._mswheel};
	protected _mswheel:WheelFun = (mx,my,delta)=>{if(this.mswheel)this.mswheel(mx,my,delta);else if(this.par)this.par.mmswheel(mx,my,delta)}
	mswheel:WheelFun=null;
	deleteMe(){this.par=null;}//called when button is being deleted
}


class Panel<NAMES=any> extends VisualElement{
	children:VisualElement[]=[];
	names:NAMES=<NAMES>{};
	restrictBorders:boolean;//are children allowed to move beyond
	// verticalLayout:boolean;
	constructor({par=BUT_GLOB.rootPanel, x=0, y=0, z=0, w=100, h=100,name='',restrictBorders=true ,verticalLayout=true }: {par?:Panel; x?: number; y?:number; z?:number;w?:number;h?:number;name?:string;restrictBorders?:boolean;verticalLayout?:boolean }){
		super(name,par,x,y,w,h,z,1);
		this.drawMe=ButFunc.drawMeRoundRect.bind(this,5)//(ctx)=>{};//
		this.restrictBorders=restrictBorders;
		// this.verticalLayout=verticalLayout;
	}

	draw(ctx:CanvasRenderingContext2D){
		if(this.active){
			ctx.beginPath();
			ctx.fillStyle = this.color.panback;
			ctx.strokeStyle=this.color.line;
			ctx.drawImage(this.canv[0],0,0);
			this.drawMe.call(this,ctx);
			for( var i=this.children.length-1; i>=0; i--){
				var p = this.children[i],px=p.x,py=p.y;
				// if(p.name=='debugPan')
				// console.log('aerhhaehr');
				
				ctx.translate(px,py);
				p.draw(ctx);
				ctx.translate(-px,-py);
			}
		}
	}
	sortButtons(){// actually only one pass up and one down.. Not complete sort
		arrSortOne(this.children,v=>v.z);
		arrSortOne(this.children,v=>v.z,true);
	}
	addChild(ch:VisualElement){
		this.children.push(ch);
		this.sortButtons();
		if(ch.name){this.names[ch.name]=ch;}	//maybe store only in names this[ch.name]=ch;
		this.childMoved(ch);
		this.setScrX(ch);
		this.setScrY(ch);
	}
	deleteChild(ch:VisualElement){
		let ind=this.children.indexOf(ch)
		if(ind!=-1)this.children.splice(ind,1);
		if(ch.name){this.names[ch.name]=undefined;}//this[ch.name]=undefined;
	}
	initPos({x=0,y=0,w=10,h=10,z=0}:XYWHZ){
		this.setXYW({x,y,w,h,z})
		// for(let i=0;i<this.children.length;i++)
			// if(this.verticalLayout)this.children[i].initPos({x:0,y:i*h/this.children.length,w:w,h:h/this.children.length});
			// else this.children[i].initPos({x:i*w/this.children.length,y:0,w:w/this.children.length,h:h});
	}
	initDraw(clr:UIClrs){
		for(let i=0;i<this.children.length;i++)this.children[i].initDraw(clr);
	}
	initActions(){
		for(let i=0;i<this.children.length;i++)this.children[i].initActions();
	}
	getButtonIn(x:number,y:number):Button{
		for(let ch of this.children)
			if(ch.inRect(x,y) && ch.active){
				if(ch instanceof Panel){
					let res = ch.getButtonIn(x-ch.x,y-ch.y);
					if(res)return res;
				}else
					if(ch instanceof Button && ch.inMask(x,y))
						return ch;
			}
		return null;
	}
	getPanelIn(x:number,y:number):Panel{
		for(let ch of this.children)
			if(ch.inRect(x,y) && ch.active){
				if(ch instanceof Panel){
					let res = ch.getPanelIn(x-ch.x,y-ch.y);
					if(res)return res;
				}
			}
		return this;
	}
	setXYW(inp: { x?: number; y?: number; w?: number; h?: number; z?: number;} = {}){
		super.setXYW(inp);
		for(let ch of this.children){
			this.childMoved(ch);
			this.setScrX(ch);
			this.setScrY(ch);
		}//ch.setXYW();//to set scrX/Y
	}
	childMoved(ch:VisualElement){
		if(this.restrictBorders){
			ch.x=mmax(0,mmin(ch.x,this.w-ch.w));
			ch.y=mmax(0,mmin(ch.y,this.h-ch.h));
			ch.w=mmin(this.w,ch.w);
			ch.h=mmin(this.h,ch.h);
		}
	}
	setScrX(ch:VisualElement){
		ch.scrX=this.scrX+ch.x;
	}
	setScrY(ch:VisualElement){
		ch.scrY=this.scrY+ch.y;
	}
	set scrX(v){this._scrX=v; if(this.children)for(let ch of this.children)this.setScrX(ch)}
	set scrY(v){this._scrY=v; if(this.children)for(let ch of this.children)this.setScrY(ch)}
	get scrX(){return this._scrX}
	get scrY(){return this._scrY}
}

class BUT_GLOB{
	static rootPanel:Panel = new Panel({par:null,x:0,y:0,name:'ROOT'});
	static mouseFocusBut:Button=null;
	static keybFocusBut:Button=null;
	// static msOverTopDraw:Button = null;
	static shiftOn=false;
	static readyLabel:Label = null;
	static activeLabel:Label = null;
	static fontSize:number = 15;
	private static lopacity:number=0;
	private static label={x:0,y:0,vx:0,vy:0,w:50,h:20,text:''};
	static hotKeys:{k:string,b:Button}[] = [];
	static debugDrawPanels:boolean=false;
	static crad:number=10;
	static stepN:number=0;
	static init(w:number,h:number){
		this.rootPanel.setXYW({w:w,h:h});
		this.rootPanel.drawMe=()=>{};
	}
	static drawAll(ctx:CanvasRenderingContext2D){
		this.stepN++;
		this.rootPanel.draw(ctx);
		// if(this.msOverTopDraw && this.msOverTopDraw.visible)
		// 	this.msOverTopDraw.draw(ctx);
		this.drawLabel(ctx);
	}
	static drawLabel(ctx,maxx=window.innerWidth,maxy=window.innerHeight){
		if(this.activeLabel)this.lopacity=mmin(this.lopacity+.1,1);
		else this.lopacity=mmax(this.lopacity-.1,0);
		if(this.lopacity==0){this.label.x=MOUSE.mx;this.label.y=MOUSE.my;this.label.vy=0;this.label.vx=0;}
		else {
			let tx = mmax(0,mmin(maxx-this.label.w,MOUSE.mx)), ty= mmax(0,mmin(maxy-this.label.h,MOUSE.my-40));
			if(dist(tx-this.label.x,ty-this.label.y)>5){
				this.label.vx+=(tx-this.label.x)*.1;
				this.label.vy+=(ty-this.label.y)*.1;
			}
			this.label.vx*=.6;
			this.label.vy*=.6;
			this.label.x+=this.label.vx;
			this.label.y+=this.label.vy;
		}
			let op = (~~(this.lopacity*0xff)).toString(16); if(op.length==1)op='0'+op;
			drawTextBox(ctx,this.label.x,this.label.y,10,this.label.w,this.label.h,this.label.text,15,{boxclr:'#ffffff'+op,textclr:'#000000'+op})
	}
	static setActive(l:Label){
		this.activeLabel=l;
		this.label.w=l.w;
		this.label.h=l.h;
		this.label.text=l.text;
	}
	static addHotKey(but, key){
		this.hotKeys.push({k:key,b:but});
	}
	// static addElement(el:VisualElement){
	// 	this.rootPanel.addChild(el);
	// }
	static deleteElement(el:VisualElement){//deletes visual element completely
		var i=-1;
		while(++i<this.hotKeys.length)
			if(this.hotKeys[i].b==el)this.hotKeys.splice(i,1);
		el.par.deleteChild(el)
		if(BUT_GLOB.mouseFocusBut==el)BUT_GLOB.mouseFocusBut=null;
		if(BUT_GLOB.keybFocusBut==el)BUT_GLOB.keybFocusBut=null;
		el.deleteMe();
	}
	static setKeybFocus(but:Button){
		if(this.keybFocusBut)this.keybFocusBut.loseKbFocus();
		this.keybFocusBut=but;
	}
}

export type ClickFun=(x:number,y:number,rmb:boolean)=>void;
export type WheelFun=(x:number,y:number,delta:number)=>void;

class Button extends VisualElement{
	state:number=0;	
	label:Label = null;
	constructor({ par=BUT_GLOB.rootPanel, x=0, y=0, w=20, h=20, z = 0, msclick =null, props={}, canvN=3,name: name=''}: ButInputs){
		super(name,par, x, y, w, h, z,canvN);
		this.props=props;
		this.msclick=msclick;
		this.drawMe = ButFunc.drawMeRoundRect.bind(this,mmin(BUT_GLOB.crad,this.h/2));
		// this.mswheel=(mx,my,rmb)=>{this.par.mmswheel()}
	}
	draw(ctx){
		if(!this.active)return;
		ctx.beginPath();
		ctx.fillStyle = this.color.back[this.state];
		ctx.strokeStyle=this.color.line;
		ctx.drawImage(this.canv[this.state],0,0);
		this.drawMe.call(this,ctx);
	}
	inMask:(x,y)=>boolean = function(){return true;}	//this will be checked when x,y are inside basic rectangle w*h
	get domsclick(){return this._msclick};
	protected _msclick:ClickFun = (mx,my,rmb)=>{this.state=1;
	if(this.msclick)this.msclick(mx,my,rmb);}
	msclick:ClickFun=null;
	get domsover(){return this._msover};
	protected _msover:ClickFun = (mx,my,rmb)=>{
		if(this.state==0)
			if(!MOUSE.mouseDown) this.state = 1;
			else if(BUT_GLOB.mouseFocusBut==this) this.state=2;
		if(this.msover)this.msover(mx,my,rmb);}
	msover:ClickFun=null;
	get domsout(){return this._msout};
	protected _msout:ClickFun = (mx,my,rmb)=>{this.state=0; if(this.msout)this.msout(mx,my,rmb);}
	msout:ClickFun=null;
	get domsdown(){return this._msdown};
	protected _msdown:ClickFun = (mx,my,rmb)=>{this.state = 2;if(this.msdown)this.msdown(mx,my,rmb);}
	msdown:ClickFun=null;
	get domsup(){return this._msup};
	protected _msup:ClickFun = (mx,my,rmb)=>{
		if(this.msup)this.msup(mx,my,rmb);}
	msup:ClickFun=null;
	get domsmove(){return this._msmove};
	protected _msmove:ClickFun = (mx,my,rmb)=>{if(this.msmove)this.msmove(mx,my,rmb);}
	msmove:ClickFun=null;
	get domsdouble(){return this._msdouble};
	protected _msdouble:ClickFun = (mx,my,rmb)=>{if(this.msdouble)this.msdouble(mx,my,rmb);}
	msdouble:ClickFun=null;
	get dokbdown(){return this._kbdown}
	protected _kbdown:(e:KeyboardEvent)=>void = (e)=>{if(this.kbdown)this.kbdown(e);}
	kbdown:((e:KeyboardEvent)=>void) = null;
	domsfullclick(mx=0,my=0,rmb=false){this.domsdown(mx,my,rmb);this.domsup(mx,my,rmb);this.domsclick(mx,my,rmb);}
	setLabel(time:number,text:string,getText:()=>string=null){
		this.label=new Label(time,text,getText);
	}
	loseKbFocus(){}
}
export type ValFun = (v:number)=>void;
class Slider extends Button{
	sideOff=0;
	valFun:ValFun;
	_val:number;
	set val(v){this._val=mmax(0,mmin(v,1));this.valFun(this._val);};
	get val(){return this._val};
	valmult:number;
	horizontal:boolean;
	maxNum:number;
	get pos(){return mmin(this.maxNum-1,~~(this.val*this.maxNum));}	//discrete representation of val from interval [0,maxNum]
	set pos(v){this.val=(v+.5)/this.maxNum;}
	constructor(inp: ButInputs&{horizontal?:boolean}){
		super(inp);
		let { par, x = 0, y = 0, w = 0, h = 0, z = 0, val = 0, maxNum = 10, valFun = (() => (null)), valmult=1, sideOff=0 }=inp;
		this.valFun=valFun;this._val=val; this.valmult=valmult;this.sideOff=sideOff;
		this.maxNum=maxNum;
		this.horizontal=inp.horizontal==undefined?w>h:inp.horizontal;
		this.drawMe=(this.horizontal)?ButFunc.drawMeHSlider:ButFunc.drawMeVSlider;
		this._msdown=function(x,y,rmb){
			this.state=2;
			this.val=(this.horizontal)?(x-this.sideOff)/(this.w-2*this.sideOff):(y-this.sideOff)/(this.h-2*this.sideOff);
			if(this.msdown)this.msdown(x,y,rmb);};
		this._msmove=function(x,y,rmb){
			this.val=(this.horizontal)?(x-this.sideOff)/(this.w-2*this.sideOff):(y-this.sideOff)/(this.h-2*this.sideOff);
			if(this.msmove)this.msmove(x,y,rmb);};
		this.mswheel=function(x,y,d){this.val=this.val+d/20*this.valmult;};	
		this._msout = (mx,my,rmb)=>{if(this.state==1)this.state=0; if(this.msout)this.msout(mx,my,rmb);}
		this._msup = (mx,my,rmb)=>{this.state=0; if(this.msup)this.msup(mx,my,rmb);}
	}
	setXYW(inp: { x?: number; y?: number; w?: number; h?: number; z?: number;sideOff?:number} = {}){
		super.setXYW(inp);
		let {w=10, h=10, sideOff=0}=inp;
		this.sideOff=sideOff;
		if(this.drawMe == ButFunc.drawMeVSlider || this.drawMe == ButFunc.drawMeHSlider)		
			this.drawMe=(this.horizontal)?ButFunc.drawMeHSlider:ButFunc.drawMeVSlider;
	}
	clickPos(pos:number,rmb:boolean=false){//simulates full click on a pos
		let {xx,yy}=(this.horizontal)?{xx:(this.w-2*this.sideOff)/this.maxNum*(pos+.5)+this.sideOff,yy:this.h/2}:{xx:this.w/2,yy:(this.h-2*this.sideOff)/this.maxNum*(pos+.5)+this.sideOff};
		this.domsfullclick(xx,yy,rmb);
	}
}
class NumSlider extends Slider{
	prevMsPos:number;
	textDrawer;
	drawText:boolean=false;
	constructor(inp: ButInputs){
		super(inp);
		let  { par, x = 0, y = 0, w = 0, h = w, z = 0, val = 0, valFun = null, drawText = false} =inp;
		this.color.line=BUT_CLR.line;
		this.valmult=10/this.maxNum;
		this.drawText=drawText;
		this.drawMe=ButFunc.drawMeNumSlider; 
		this._msdown=function(x,y,rmb){this.state=2;this.prevMsPos=y;if(this.msdown)this.msdown(x,y,rmb);};
		this._msmove=function(x,y,rmb){this.val = mmax(0,mmin(1,this.val-.01*(y-this.prevMsPos)*this.valmult));this.prevMsPos=y;if(this.msmove)this.msmove(x,y,rmb);};
		if(drawText)this.textDrawer = getTextDrawer.call(this);
	}
	setXYW(inp: { x?: number; y?: number; w?: number; h?: number; z?: number; crad?: number;} = {}){
		super.setXYW(inp);
		if(this.drawText)this.textDrawer = getTextDrawer.call(this);
	}
}
export class ListSlider extends NumSlider{
	lines:string[];
	lstTop:number;
	lstBot:number;
	lstTopnow:number=0;
	lstBotnow:number=0;
	fontSize:number;
	valv:number=0;//dont delete
	free:boolean=true;
	oldval:number=0;
	get line(){return this.lines[this.pos]};
	constructor(inp: ButInputs){
		super(inp);
		let  { lstTop=null,lstBot=null,fontSize=15, lines=[] } =inp;
		this.lines=lines;
		this.maxNum=lines.length;
		this.valmult=10/this.maxNum;
		this.lstTop=lstTop;
		this.lstBot=lstBot;
		this.fontSize=fontSize;
		this.drawMe=ButFunc.drawMeListSlider;
		// this.msOverToTop=true;
		this._msdown=function(x,y,rmb){
			this.state=2;this.prevMsPos=y;
			if(this.msdown)this.msdown(x,y,rmb);
			this.free=false;
		};
		this._msup=function(mx,my,rmb){
			this.state=0; if(this.msup)this.msup(mx,my,rmb);
			this.free=true;
		};
		
	}
	setXYW(inp: { x?: number; y?: number; w?: number; h?: number; z?: number; crad?: number; lstTop?:number,lstBot?:number,fontSize?:number} = {}){
		super.setXYW(inp);
		let {lstTop=this.lstTop,lstBot=this.lstBot,fontSize=15} = inp;
		this.lstTop=lstTop;
		this.lstBot=lstBot;
		this.fontSize=fontSize;
	}
}
class Checkbox extends Button{
	checked=false;
	radGr:RadioGroup = null;
	constructor(inp: ButInputs & {checked?:boolean}){
		super(inp);
		let { par, x = 0, y = 0, w = 0, h = 0, z = 0 }=inp;
		this._msclick = function(mx,my,rmb){ this.switch();this.state=this.checked?2:1; if(this.msclick)this.msclick(mx,my,rmb);};
		this._msout = function(mx,my,rmb){ this.state=this.checked?2:0; if(this.msout)this.msout(mx,my,rmb);};
		if(inp.checked)this.check();
		// this._draw = function(ctx){
		// 	ctx.fillStyle = this.color[this.state];
		// 	ctx.shadowColor = 'black';
		// 	ctx.shadowOffsetX = 2-this.state;
		// 	ctx.shadowOffsetY = 2-this.state;
		// 	ctx.beginPath();
		// 	ctx.strokeStyle="#000000";
		// 	ctx.drawImage(this.canv[this.state],this.x,this.y);
		// 	this.drawMe(ctx);
		// 	if(this.checked){
		// 			ctx.lineStyle="#000000";ctx.lineWidth=1;ctx.stroke();
		// 	}
		// };
	}
	addToRadio(radGr:RadioGroup){
		this.radGr = radGr;
		this._msclick = function(mx,my,rmb){this.radGr.switchOn(this);this.state=this.checked?2:1; this.check(); if(this.msclick)this.msclick(mx,my,rmb);};
		this.deleteMe = function(){this.radGr.remove(this);this.par=null;}
	}
	switch(){this.checked=!this.checked;};
	check(){this.checked=true;this.state=2;};
	uncheck(){this.checked=false;this.state=0;};
}
class Switcher extends Button{
	pos=0;
	posN:number;
	valFun:ValFun;
	constructor(inp: ButInputs){
		super(inp);
		let { par, x = 0, y = 0, w = 0, h = 0, z = 0, posN = 3, valFun = ()=>{}}=inp;
		this.color.line=BUT_CLR.line;
		this.posN=posN; this.valFun=valFun;
		this._msclick = function(mx,my,rmb){this.state=1; this.switch(rmb?-1:1);this.valFun(this.pos); if(this.msclick)this.msclick(mx,my,rmb);};
		this.drawMe=ButFunc.drawMeSwitcher;
	}
	switch(dir){this.pos=(this.pos+dir+this.posN)%this.posN;};
}
class DragBut extends Button{
	dragx:number; dragy:number;
	limits:{x1:number,x2:number,y1:number,y2:number};
	constructor(inp: ButInputs){
		super(inp);
		let { limits={x1:0,x2:500,y1:0,y2:500} }=inp;
		this.limits=limits;
		// this.color.line=BUT_CLR.line;
		this._msdown = function(mx,my,rmb){
			this.state=2;
			this.dragx=mx;
			this.dragy=my;
			if(this.msdown)this.msdown(mx,my,rmb);};
		this._msmove = function(mx,my,rmb){
			this.setXYW({x: mmin(limits.x2,mmax(limits.x1,this.x-this.dragx+mx)), y:mmin(limits.y2,mmax(limits.y1,this.y-this.dragy+my))});
			if(this.msdown)this.msdown(mx,my,rmb);};
	}
}
class RadioGroup{
	list:{ch:Checkbox, label:string}[]=[];
	pos:number=-1;
	label:string;
	constructor(members:{ch:Checkbox,l:string}[]=[]){
		for(let m of members)this.add(m.ch,m.l);
	}
	add(ch:Checkbox, label:string=''){
		if(ch.radGr)throw new Error('Checkbox already in radio group!');
		this.list.push({ch:ch, label:(label)});//||(this.list.length+'')
		ch.addToRadio(this);
		// if(this.list.length==1){
		// 	this.pos=0;
		// 	this.switchOn(0);
		// }
	}
	remove(ch:Checkbox){
		let ind = arrFind<any>(this.list,(a)=>(a.ch==ch));
		if(ind==undefined)throw new Error('removing error');
		if(this.pos>ind)this.pos--;
		if(this.pos==ind)this.switchOn(0);
		this.list.splice(ind,1);
	}
	switchOn(ch:number|Checkbox){
		if(ch instanceof Checkbox)ch = arrFind(this.list,(a)=>(a.ch==ch));
		if(this.pos>-1)this.list[this.pos].ch.uncheck();
		this.pos=ch;
		this.label = this.list[ch].label;
		this.list[ch].ch.check();
	};
	switchAllOff(){
		if(this.pos>-1)this.list[this.pos].ch.uncheck();
	}
}

class Label{
	w:number=100;h:number=50;
	private timeoutSet:boolean=false;
	constructor(public time:number, public text:string='', public getText:()=>string=null){
	}
	beginTimeout(){
		BUT_GLOB.readyLabel = this;
		if(!this.timeoutSet){setTimeout(this.timeout.bind(this),this.time);
		this.timeoutSet=true;}
	}
	timeout(){
		this.timeoutSet=false;
		if(BUT_GLOB.readyLabel == this){
			if(this.getText)this.text = this.getText();
			this.w = 10+10+this.text.length*BUT_GLOB.fontSize*.5;
			this.h = 20;
			BUT_GLOB.readyLabel = null;
			BUT_GLOB.setActive(this);
		}
	}
}
//some shapes for button drawing
const SHAPES = {
	plus:[[.3,.3],[.3,0],[.7,0],[.7,.3],[1,.3],[1,.7],[.7,.7],[.7,1],[.3,1],[.3,.7],[0,.7],[0,.3]],
	arrowR:[[0,.3],[.6,.3],[.6,0],[1,.5],[.6,1],[.6,.7],[0,.7]],
	play:[[0,0],[1,.5],[0,1]],
	rect:[[0,0],[1,0],[1,1],[0,1]],
	saveIcon:[[0,0],[.2,0],[.2,.4],[.7,.4],[.7,0],[.8,0],[1,.2],[1,1],[0,1]]
}
function getTextDrawer(fontSize:number,text:string=null,clr:string=this.color.text):((ctx:CanvasRenderingContext2D, fontS) => void)|((ctx:CanvasRenderingContext2D,fontS,text) => void){
	if(!text)return (ctx, fontSize, text)=>{ButFunc.drawMeText.call(this, ctx, text, fontSize, clr);}
	return (ctx, fontSize)=>{ButFunc.drawMeText.call(this, ctx, text, fontSize, clr);}
}


export {VisualElement,Panel,Button,ButInputs,Slider, Checkbox, RadioGroup, ButFunc, getTextDrawer, NumSlider,Switcher,DragBut,SHAPES,BUT_CLR, BUT_GLOB};