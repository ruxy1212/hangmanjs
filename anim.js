var cz, w, h, ydir, ynow, rtir, rdir, xdir, xnow, xdest, ydest, rstate = true;
var circ = document.querySelector('.circ');
initVal();
getRandom(); 
setMove();
startMove();

function startMove(){
    cz = setInterval(function() {
        if(rsir >= xdiff){
            clearInterval(cz);
            initVal();
            getRandom();
            setMove();
            startMove();
        }  
        if(!rstate) clearInterval(cz);
         
        circ.style.top = (ydir) ? ynow+(rtir/rdir)+'px' : (ynow-(rtir/rdir))+'px';
        circ.style.left = (xdir) ? xnow+(rtir)+'px' : (xnow-(rtir))+'px';
        ynow = (ydir) ? ynow+(rtir/rdir) : ynow-(rtir/rdir);
        xnow = (xdir) ? xnow+(rtir) : xnow-(rtir);
        rsir += rtir;
    }, 25);
}

function setMove(){ 
    var body = document.body.getBoundingClientRect();
    var rect = circ.getBoundingClientRect();
    xnow = rect.left; ynow = rect.top;
    xdest = (body.right - rect.width)*w; ydest = (body.bottom - rect.width)*h;
    if(xdest > xnow){
        xdiff = xdest - xnow;
        xdir = true; //toRight;
    }else{
        xdiff = xnow - xdest;
        xdir = false; //toLeft;
    }
    if(ydest > ynow){
        ydiff = (ydest - ynow)+1;
        ydir = true; //toDown;
    }else{
        ydiff = (ynow - ydest)-1;
        ydir = false; //toUp;
    }
    rdir = xdiff/ydiff;
    rtir = 2; //xdiff/100;
    rsir = rtir;
}
function initVal(){
    w = 0;
    h = 0;
    ydir = true;
    ynow = 0;
    rtir = 0;
    rdir = 0; 
    xdir = true;
    xnow = 0;
    xdest = 0;
    ydest = 0;
}
function getRandom(){
    w = (Math.floor(Math.random()*100)+1) / 100; 
    h = (Math.floor(Math.random()*100)+1) / 100;
}