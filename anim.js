// var cz, w, h, r, ydir, ynow, rtir, rdir, xdir, xnow, xdest, ydest, rstate = true;
// var circ = document.querySelector('.circ'), circdiv = document.querySelector('.main');
// moveIt();
// function moveIt(){
//     initVal();
//     getRandom(); 
//     setMove();
//     startMove();
// }

// function startMove(){
//     cz = setInterval(function() {
//         var body = circdiv.getBoundingClientRect();
//         var rect = circ.getBoundingClientRect();
//         if((ydir == false && rect.top <= (body.top+10)) || (xdir == false && rect.left <= (body.left+10)) || (xdir == true && rect.right >= (body.right-10)) || (ydir == true && rect.bottom >= (body.bottom-10))){ //rsir >= xdiff..(rsir >= (xdiff-10) && 
//             clearInterval(cz); moveIt();
//         //     initVal();
//         //     getRandom();
//         //     setMove();
//         //     startMove();

//         }  
//         if(!rstate) clearInterval(cz);

//         // circ.style.top = (ydir) ? ynow+(rtir/rdir)+'px' : (ynow-(rtir/rdir))+'px';
//         // circ.style.left = (xdir) ? xnow+(rtir)+'px' : (xnow-(rtir))+'px';
//         ynow = (ydir) ? ynow+(rtir/rdir) : ynow-(rtir/rdir);
//         xnow = (xdir) ? xnow+(rtir) : xnow-(rtir);
//         circ.style.top = ynow+'px';
//         circ.style.left = xnow+'px';
//         rsir += rtir;
//     }, 50);
// }

// function setMove(){ 
//     var body = circdiv.getBoundingClientRect();
//     var rect = circ.getBoundingClientRect();
//     xnow = rect.left; ynow = rect.top;
//     xdest = (body.right - rect.width)-100; ydest = (body.bottom - rect.width)-100;
//     if(xdest > xnow){
//         xdiff = xdest - xnow;
//         xdir = true; //toRight;
//     }else{
//         xdiff = xnow - xdest;
//         xdir = false; //toLeft;
//     }
//     if(ydest > ynow){
//         ydiff = (ydest - ynow)+1;
//         ydir = true; //toDown;
//     }else{
//         ydiff = (ynow - ydest)-1;
//         ydir = false; //toUp;
//     }
//     rdir = (90-r)/r; //xdiff/ydiff;
//     rtir = body.width * 0.02; //xdiff/100;
//     rsir = rtir;
// }
// function initVal(){
//     w = 0;
//     h = 0;
//     r = 0;
//     ydir = true;
//     ynow = 0;
//     rtir = 0;
//     rdir = 0; 
//     xdir = true;
//     xnow = 0;
//     xdest = 0;
//     ydest = 0;
// }
// function getRandom(){
//     w = (Math.floor(Math.random()*80)+20) / 100; 
//     h = (Math.floor(Math.random()*80)+20) / 100;
//     w = 0.9; h = 0.9;
//     r = (Math.floor(Math.random()*61)+15);
// }

// ////https://javascriptobfuscator.com/Javascript-Obfuscator.aspx



var cz, w, h, r, ydir, ynow, rtir, rdir, xdir, xnow, xdest, ydest, xorig, yorig, xlast = true, ylast = true, rstate = true;
var circ = document.querySelector('.circ');
var circdiv = document.querySelector('.main');

moveIt();

function moveIt() {
    initVal();
    getRandom();
    setMove();
    startMove();
}

function startMove() {
    cz = setInterval(function () {
        var body = circdiv.getBoundingClientRect();
        var rect = circ.getBoundingClientRect();

        if ((ydir == false && rect.top <= body.top) || (xdir == false && rect.left <= body.left) || (xdir == true && rect.right >= body.right) || (ydir == true && rect.bottom >= body.bottom)) {
            clearInterval(cz);
            moveIt();
        }
        if(!rstate) clearInterval(cz);

        ynow = ydir ? ynow + rtir / rdir : ynow - rtir / rdir;
        xnow = xdir ? xnow + rtir : xnow - rtir;
        circ.style.top = ynow + 'px';
        circ.style.left = xnow + 'px';
    }, 50);
}

function setMove() {
    var body = circdiv.getBoundingClientRect();
    var rect = circ.getBoundingClientRect();
    xnow = rect.left;
    ynow = rect.top;
    xdest = body.right - rect.width - (0.05*body.width);
    ydest = body.bottom - rect.height - (0.05*body.height);
    xorig = 0.05*body.width;
    yorig = 0.05*body.height;

    if (xdest > xnow && xnow > xorig) {
        if(xlast) xdir = true;
        else xdir = false;            
        xlast = xdir;
    } else {
        if(xdest <= xnow) xdir = false;
        else if(xnow <= xorig) xdir = true;
        xlast = xdir;
    }
    if (ydest > ynow && ynow > yorig) {
        if(ylast === true) ydir = true;
        else ydir = false;            
        ylast = ydir;
    } else {
        if(ydest <= ynow) ydir = false;
        else if(ynow <= yorig) ydir = true;
        ylast = ydir;
    }
    rdir = 90 / r;
    rtir = body.width * 0.02;
}

function initVal() {
    w = 0;
    h = 0;
    r = 0;
    ydir = true;
    ynow = 0;
    rtir = 0;
    rdir = 0;
    xdir = true;
    xnow = 0;
    xdest = 0;
    ydest = 0;
}

function getRandom() {
    w = (Math.floor(Math.random() * 80) + 20) / 100;
    h = (Math.floor(Math.random() * 80) + 20) / 100;
    w=0.9; h=0.9; // these values are not used in the code
    r=(Math.floor(Math.random()*61)+15);
}