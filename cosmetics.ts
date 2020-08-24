import { roomw, roomh, camy, camx, scrw, scrh, mainCanv } from "./main.js";


export let backCanv:HTMLCanvasElement=<HTMLCanvasElement>document.getElementById('backcan');
export let backctx:CanvasRenderingContext2D=backCanv.getContext('2d');

type Net={x1:number,x2:number,y1:number,y2:number}[];
type NetType='square'|'hex';
export class Cosmetics{
  static backMap:NetType[][]
  static backgr:Net[][]=[];
  static size:number=300;
  static rx:number;
  static ry:number;
  static scale=.9;
  
  static draw(ctx:CanvasRenderingContext2D){
    ctx.strokeStyle='#777777';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.save();
    ctx.translate(-camx,-camy);
    let cx=-camx-roomw/2,cy=-camy-roomh/2;
    for(let i=-1;i<2;i++){

      for(let j=-1;j<2;j++){

        for(let ln of this.backgr[this.ry+i][this.rx+j]){
          ctx.moveTo(ln.x1,ln.y1);
          ctx.lineTo(ln.x2,ln.y2);
        }
        ctx.translate(roomw,0);
        
      }
      ctx.translate(-3*roomw,0);
      ctx.translate(0,roomh);

    }
    ctx.stroke();
    ctx.restore();
    backctx.clearRect(0,0,backCanv.width,backCanv.height);
    let offx=(1-this.scale)*mainCanv.width*.5, offy=(1-this.scale)*mainCanv.height*.5;
    backctx.drawImage(mainCanv,0,0,mainCanv.width,mainCanv.height,offx,offy,this.scale*mainCanv.width,this.scale*mainCanv.height);

  }
  static setActRoom(rx:number,ry:number){
    for(let i=-1;i<2;i++)
      for(let j=-1;j<2;j++)
        this.crtBackgr(rx+j,ry+i);
    this.rx=rx;
    this.ry=ry;
  }
  static crtBackgr(cx,cy){
    if(!this.backgr[cy])this.backgr[cy]=[];
    if(!this.backgr[cy][cx])this.backgr[cy][cx]=this.getNet(cx,cy);
  }
  static getNet(cx:number,cy:number,type:NetType='square'):Net{
    let net:Net=[];
    switch(type){
      case 'hex':
        break;
      case 'square':
          let xx=this.size-((roomw*cx)%this.size+this.size)%this.size,sy=this.size-((roomh*cy)%this.size+this.size)%this.size,yy:number;
          while(xx<=roomw){
            yy=sy;
            while(yy<=roomh){
              net.push({x1:xx,y1:yy,x2:xx+this.size,y2:yy});
              net.push({x1:xx,y1:yy,x2:xx,y2:yy+this.size});
              yy+=this.size;
            }
            xx+=this.size;
          }
        break;
    }
    return net;
  }
}