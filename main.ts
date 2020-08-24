import { BUT_GLOB, Button } from "./button.js";
import { isRightMB, drawCircle, drawTextBox } from "./tech.js";
import { Collider, Line } from "./collider.js";
import { FieldObject, Room, Player, Natto, Face, SmartFace } from "./objects.js";
import { Cosmetics, backCanv, backctx } from "./cosmetics.js";
import { dist2Pt, dist, mabs } from "./math.js";


export let scrw=640,scrh=480;
export let mainCanv:HTMLCanvasElement=<HTMLCanvasElement>document.getElementById('can');
let mainctx:CanvasRenderingContext2D=mainCanv.getContext('2d');

mainCanv.width = scrw;
mainCanv.height = scrh;
backCanv.width = scrw;
backCanv.height = scrh;
backctx.filter = 'blur(4px) opacity(.7)';// 
BUT_GLOB.init(mainCanv.width,mainCanv.height);
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
window.addEventListener('mousedown', msDown);
window.addEventListener('mouseup', msUp);
window.addEventListener('mousemove', msMove);



var gameRunning=true;
export type Point={x:number,y:number};
export let roomh=scrh,roomw=scrw,allRooms:Room[][]=[[]];//(can.width,can.height,0,0)]];//
export let allObjects:FieldObject[]=[], toDestroy:FieldObject[]=[];
let msdCrd:Point&{time:number,cos:number,sin:number}=null;
export let bigText:{str:string,t:number}={str:null,t:null};
// export type Wall={x1:number,y1:number,x2:number,y2:number,clr?:string};
export let level:{walls:Line[]}[][]=[];
let lastWall:{w:Line,rx:number, ry:number}=null;


new Button({par:BUT_GLOB.rootPanel,w:150,h:150,msclick:()=>{createObject(roomw*Math.random(),roomh*Math.random());}});
new Button({par:BUT_GLOB.rootPanel,x:150,w:150,h:150,msclick:()=>{createNatto(roomw*Math.random(),roomh*Math.random(),4*Math.random()-2,4*Math.random()-2);}});

// for(let i=-1;i<2;i++)
//   for(let j=-1;j<2;j++){
//     crtRoom(j,i);
//     allRooms[i][j].activate((j+1)*roomw,(i+1)*roomh);
//   }

export let actRoom:Point={x:null,y:null}, camx=0, camy=0, camvx=0, camvy=0; 

export let colliderMain:Collider=new Collider(~~ (roomw*3/200)+1,~~ (roomh*3/200)+1,200,
    [Collider.commonPutters.putRectMov,Collider.commonPutters.putLine],
    [[Collider.commonCheckers.circToCirc,Collider.commonCheckers.circToLine2],[Collider.commonCheckers.circToLine2,Collider.commonCheckers.falser]]
  );

initLevel();
export let player:Player=new Player(1,1,0,0,30,100);
crtRoom(0,0);
allRooms[0][0].addObj(player);


console.log('start');
gameStep();


function gameStep(){
	if(gameRunning)setTimeout(gameStep, 10);
	worldStep();
	drawAll();
}

function drawAll(){
  mainctx.clearRect(0,0,mainCanv.width,mainCanv.height);
  Cosmetics.draw(mainctx);
  if(bigText.str){
    drawTextBox(mainctx,scrw*.2,scrh*.3, 5,scrw*.6,50,bigText.str,35,{boxclr:'#00000000',textclr:"#000000"});
    if(--bigText.t<=0)bigText.str=null;
  }
  BUT_GLOB.drawAll(mainctx);
  // colliderMain.debugDrawGrid(mainctx);

  // let di=(camy>=0)?1:-1,dj=(camx>=0)?1:-1;
  // allRooms[actRoom.y][actRoom.x].draw(mainctx,camx,camy);
  // allRooms[actRoom.y+di][actRoom.x].draw(mainctx,camx,camy);//-di*roomh
  // allRooms[actRoom.y][actRoom.x+dj].draw(mainctx,camx,camy);//-dj*roomw
  // allRooms[actRoom.y+di][actRoom.x+dj].draw(mainctx,camx,camy);//-di*roomh-dj*roomw
  mainctx.translate(-camx,-camy);
  for(let i=-1;i<2;i++)
    for(let j=-1;j<2;j++)
      allRooms[actRoom.y+i][actRoom.x+j].draw(mainctx);
  for(let o of allObjects)o.drawMe(mainctx);
  // console.log(allObjects.length);
  
  if(msdCrd){
    if(msdCrd.time<50)msdCrd.time++;
    // drawCircle(mainctx,player.x,player.y,(50-msdCrd.time)*.3,'#55555555');
    drawCircle(mainctx,player.x+msdCrd.cos*msdCrd.time*3,player.y+msdCrd.sin*msdCrd.time*3,msdCrd.time*.3,player.color+'55');

  }

  mainctx.translate(camx,camy);
}

function worldStep(){

  colliderMain.dynPutOnGrid();
  let lst = colliderMain.objList, i=0, colNum=0;
  
  while( i<lst.length){
    let colTupl = colliderMain.getColls(lst[i],true,false);
    if(colTupl.objs.length>0){
      Collider.collideWall(lst[i].obj, colTupl.cols[0].cos, colTupl.cols[0].sin,0);
      colliderMain.unintersect(lst[i],colTupl.objs[0], colTupl.cols[0]);
      colliderMain.putOnGrid(lst[i]);             
    } else {
      colTupl = colliderMain.getColls(lst[i],false,true);
      if(colTupl.objs.length>0){
        let obj1:FieldObject=lst[i].obj, obj2:FieldObject=colTupl.objs[0].obj;
        let bounce=obj1.collide(obj2);
        bounce=obj2.collide(obj1) && bounce;
        if(bounce){
          let imp=Collider.collide(obj1,obj2,colTupl.cols[0].cos, colTupl.cols[0].sin);
          if(imp==null)colliderMain.unintersect(colTupl.objs[0],lst[i], colTupl.cols[0]);
        }
        colliderMain.putOnGrid(lst[i]);             
        colliderMain.putOnGrid(colTupl.objs[0]);
      } else {
        i++;
        colNum = 0;
      }
    }
    if(++colNum>15){
        i++;
        colNum = 0;
    }
  }
  
  
  for(let o of allObjects)o.step();
  for(let i=-1;i<2;i++)
    for(let j=-1;j<2;j++)
      allRooms[actRoom.y+i][actRoom.x+j].step();
      
  // setCam(player.x-scrw/2,player.y-scrh/2);
  let dx=player.x-camx-scrw/2, dy=player.y-camy-scrh/2;
  camx+=camvx;
  camy+=camvy;
  camvx=(camvx+(dx-2*camvx)*.03)*.7;
  camvy=(camvy+(dy-2*camvy)*.03)*.7;
  // camvy*=.9;

  while(toDestroy.length>0)toDestroy.pop().destroy();
}

function createObject(x:number,y:number){
  let obj=new SmartFace({x,y,rad:40});
  allRooms[actRoom.y][actRoom.x].addObj(obj);//,ro:Room
}

function createNatto(x:number,y:number,vx:number,vy:number){
  let obj=new Natto(x,y,vx,vy,10,45);
  allRooms[actRoom.y][actRoom.x].addObj(obj);//,ro:Room
}

export function setCam(cx,cy){
  camx=cx;
  camy=cy;
}

function keyDown(e:KeyboardEvent){
	switch(e.key){
		case ' ': player.doeating=true;player.mouth.tp=3;player.eyes.forEach(e=>e.tp=1);player.doeating=true; break;
		case 'w': player.control.w=1; break;
		case 'a': player.control.a=1; break;
		case 's': player.control.s=1; break;
		case 'd': player.control.d=1; break;
	}
}
function keyUp(e:KeyboardEvent){
	switch(e.key){
		case ' ': player.doeating=false;player.mouth.tp=0;player.eyes.forEach(e=>e.tp=0);player.doeating=false; break;
		case 'w': player.control.w=0; break;
		case 'a': player.control.a=0; break;
		case 's': player.control.s=0; break;
		case 'd': player.control.d=0; break;
	}
}
function msDown(e:MouseEvent){
  let rmb=isRightMB(e),x=e.clientX,y=e.clientY;
  // msdCrd={x:x,y:y,time:0,sin:0,cos:1};
  player.mouth.tp=3;
  player.eyes.forEach(e=>e.tp=1);
}
function msUp(e:MouseEvent){
  let rmb=isRightMB(e),x=e.clientX,y=e.clientY;
  player.spit(-msdCrd.sin,-msdCrd.cos,msdCrd.time/100+.5,[new FieldObject(0,0,0,0,10,10)])
  msdCrd=null;
  player.mouth.tp=4;
  player.emotimer=15;
}
function msMove(e:MouseEvent){
  let rmb=isRightMB(e),x=e.clientX,y=e.clientY;
  if(msdCrd){
    let dx=x-msdCrd.x,dy=y-msdCrd.y, dd=dist(dx,dy);
    msdCrd.cos=dx/dd;
    msdCrd.sin=dy/dd;
  }
}

export function crtRoom(crdx:number,crdy:number){
  let ro:Room;
  if(!allRooms[crdy])allRooms[crdy]=[];
  if(!allRooms[crdy][crdx]){
    ro=new Room(roomw,roomh,crdx,crdy);
    allRooms[crdy][crdx]=ro;
    let lv=level[crdx][crdy];
    if(lv){
      lv.walls.forEach(w=>ro.addWall(w))
    }
  }else console.log('Error new room');
}
function initLevel(){
  for(let i=-30;i<30;i++){
    level[i]=[];
    for(let j=-30;j<30;j++)
      level[i][j]={walls:[]};
  }
  addWall(0,0,10,10,100,150,'#aa7777');
  connectWall(130,170);
  connectWall(170,190);
}
function addWall(rx:number,ry:number,x1:number,y1:number,x2:number,y2:number,clr:string=undefined){
  let w:Line=new Line(x1,y1,x2,y2);//{x1:x1,y1:y1,x2:x2,y2:y2};
  level[rx][ry].walls.push(w);
  if(clr)w.color=clr;
  lastWall={w,rx,ry};
}
function connectWall(x:number,y:number){
  if(!lastWall)throw new Error('wall');
  let w=lastWall.w,x1=w.x2,y1=w.y2;
  if(mabs(x-x1)>scrw/2){lastWall.rx++; x1-=scrw;}
  if(mabs(y-y1)>scrh/2){lastWall.ry++; y1-=scrh;}
  addWall(lastWall.rx,lastWall.ry,x1,y1,x,y);
}