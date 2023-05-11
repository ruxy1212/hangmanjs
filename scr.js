var gscore = [8,20,50,120], cx, lvname = ['Magician', 'Viserion', 'Inferno', 'Immortal'];
var keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", chrLeft = [], index = 0, fail = 0;
var hold0 = '<div style="background-image: url(img/', hold2 = '.png);"></div>';
var res1 = ["Way to Go!", "Oops!"], res2 = ["You found the word", 'The word was "'], res3 = [" Points", "Better luck next time"];
var gbgs = ["255, 255, 255", "222, 222, 222", "231, 218, 218", "231, 225, 218", "231, 231, 218", "224, 231, 218", "218, 231, 223", "218, 231, 230", "218, 222, 231", "224, 218, 231", "231, 218, 230", "216, 180, 180", "216, 199, 180", "215, 216, 180", "194, 216, 180", "180, 216, 193", "180, 208, 216", "180, 186, 216", "192, 180, 216", "216, 180, 211"];
audioFiles = ["msc/AftertheRain.mp3", "msc/ThroughtheArbor.mp3", "msc/SundialDreams.mp3", "msc/TheEnchantedGarden.mp3", "msc/Butterfly.mp3", "msc/StrawHats.mp3", "msc/AnotherRealm.mp3", "msc/WaterLillies.mp3", "msc/FairyWings.mp3", "msc/PaperClouds.mp3"];
audFiles = ["msc/click.mp3", "msc/warn.mp3", "msc/boo.mp3", "msc/cheer.mp3", "msc/gallows.mp3"];
var localSetting = {mode: true, difficulty: 0, set: false, sound: false, arena: false, tpoints: 0, tgames: 0, nwords: 0, fwords: 0, hscore: 0, pwords: 0};
var wordlen = 0, arclevel = 0, arcindex = [], hintlen = 2, gpoint = 0, obons = 0, msc = 0, secph = [];
var ph = qSel('.about-span', false, 0);
fetch(qSel('.about-span', false, 0).innerHTML)
.then(response => response.text())
.then(about => { secph = JSON.parse(about).span; qSel('.about-span', false, 0).parentNode.removeChild(qSel('.about-span', false, 0)); });
// var audio = new Audio("msc/"+audioFiles[msc]); //audio.preload = true;
var audio = new Howl({volume: 0.15, muted: true, src: [audioFiles[msc]], onend: function(){controlMsc();}, onplayerror: function(){audio.once('unlock', function() {audio.play();});}});
var clk = new Howl({src: ["msc/click.mp3"], preload: true });
var wrn = new Howl({src: ["msc/warn.mp3"], preload: true });
var boo = new Howl({src: ["msc/boo.mp3"], preload: true });
var chr = new Howl({src: ["msc/cheer.mp3"], preload: true });
var die = new Howl({src: ["msc/gallows.mp3"], preload: true });

var rn = 1, hlast = 1;

const settings = JSON.parse(localStorage.getItem('hngset'));
if (settings) {
    localSetting = settings;
}else{
    dset = {mode: true, difficulty: 0, set: false, sound: false, arena: false, tpoints: 0, tgames: 0, nwords: 0, fwords: 0, hscore: 0, pwords: 0};
    localStorage.setItem('hngset', JSON.stringify(dset));    
}
if(localSetting.sound){ playAudio(); qSel('.chkswitch.snd', false, 0).checked = true; }
else { pauseAudio(); qSel('.chkswitch.snd', false, 0).checked = false; }
qSel('.chkinput', false, 0).checked = (localSetting.set) ? true : false ; 

function fader(fadee){
    var fadeOut = setInterval(function(){
        if(!fadee.style.opacity) fadee.style.opacity = 1;
        if(fadee.style.opacity > 0) fadee.style.opacity -= 0.15;
        else { 
            clearInterval(fadeOut); 
            fadee.style.display = "none"; 
            document.querySelector('.main').style.display = "none"; }
    }, 50);
}
function preLoader(){
   fader(document.querySelector('.preload'));
   rstate = false;
}

window.onload = function () {
    preLoader();

    qSel('.divider', false, 0).addEventListener(
          'touchmove',
          function (e) {
                wH = window.innerHeight;
                tY = e.touches[0].clientY;
                eL = qSel('.keyarea', false, 0);
                resY = wH - tY - eL.offsetHeight;
                if (resY < 0) {
                      resY = 0;
                } else if (resY > wH / 2) {
                      resY = wH / 2;
                }
                eL.style.bottom = resY + "px";
          },
          false
    );
    initMsc();
    createKeys();
    createHint();
};
function controlMsc(){
    msc++;
    if(msc<audioFiles.length){
        audio = new Howl({volume: 0.15, muted: localSetting.sound, src: [audioFiles[msc]], preload: true, onend: function(){controlMsc();}, onplayerror: function(){audio.once('unlock', function() {audio.play();});}});
    }else{
        msc = 0;
        audio = new Howl({volume: 0.15, muted: localSetting.sound, src: [audioFiles[0]], preload: true, onend: function(){controlMsc();}, onplayerror: function(){audio.once('unlock', function() {audio.play();});}});
    }
    audio.play();
}
function initMsc(){ 
    audio.play();
}
function switchAud(){
    audio.mute(!(qSel('.chkswitch.snd', false, 0).checked))
}
function playAudio(){
    audio.mute(false);
}
function pauseAudio(){
    audio.mute(true);
}
function audClick(){
    clk.volume(0.2);
    clk.play();
}
function audWarn(){
    wrn.volume(0.15);
    wrn.play();
}
function audBoo(){
    boo.play();
}
function audCheer(){
    chr.play();
}
function audDie(){
    die.play();
}
function createKeys() {
    var kb = qSel('.keyboard', false, 0);
    kb.innerHTML = '';
    for (i = 0; i < keys.length; i++) {
          var k = document.createElement('span');
          k.className = 'key';
          k.innerText = keys[i];
          k.setAttribute("data", "");
          k.onclick = function () {
                chrCheck(this);
          };
          kb.appendChild(k);
    } 
}

function createHint(){
    var kb = qSel('.keyboard', false, 0);
    var k = document.createElement('span');
    k.className = 'key hint unsee';
    k.innerText = 'i';
    k.setAttribute("data", "");
    k.onclick = function (){
        rn = Math.floor(Math.random()*hintlen);
        while(hlast == rn)
            rn = Math.floor(Math.random()*hintlen);
            
        Swal.fire('Hint:', secph[index][rn+1]);
        hlast = rn;
    }
    kb.appendChild(k);
}

function createWord() {
    var chrs = qSel('.word', false, 0);
    chrs.innerHTML = "";
    //133 items
    //arcindex 
    for(let i=0; i<133; i++){
        index = Math.floor(Math.random() * secph.length);
        if(arcindex.indexOf(index) == -1) break;
    }
    if(arcindex.length >= 132) arcindex = [];
    arcindex.push(index);
    wordlen = secph[index][0].length;
    for (i = 0; i < secph[index][0].length; i++) {
        var w = secph[index][0][i].toUpperCase();
        var k = document.createElement("span");
        k.className = "l" + (w == " " ? " ls" : "");
        k.innerHTML = "&nbsp";
        chrs.appendChild(k);

          if (w != " ") {
                if (chrLeft.indexOf(w) == -1) {
                      chrLeft.push(w);
                }
          }
    }
}

function clearKeys() {
    var k = qSel('.key', true, -1);
    for (i = 0; i < k.length; i++) {
          k[i].setAttribute("data", "");
    }
}

function clearPty() {
    fail = 0;
    hintlen = 2;
    chrLeft = [];
    qSel('.phold', false, 0).innerHTML = hold0+'f1'+hold2;
}

function gCount(){
    if(chrLeft.length == 0) return;
    clearInterval(cx);
    var t = qSel('.gtimer', false, 0);
    var start = 16, mid = 6, end = 0;

    cx = setInterval(function() {
        end++;
        var dis = start - end;
        if (dis < 0) {
            clearInterval(cx);
            t.className = "gtimer ptimer unsee";
            gameEnd(false, 0);
        } else{
            if(dis < mid){
                t.className = "gtimer ptimer";
            }else{
                t.className = "gtimer";
            }
            t.innerHTML = padUp(dis,2);
        }   
    }, 1000);
}
function chrCheck(k) {
    if(fail > 9) return;
    if (k.getAttribute("data") == "") {
          (localSetting.difficulty == 3)?gCount():"";
          var w = isExist(k.innerText);
          k.setAttribute("data", w);
          if (w) {
              audClick();
              makeHappy();
              getPercent();
                if (chrLeft.length == 0) {
                    var gb = getBonus();
                    (localSetting.difficulty == 3)?clearInt():"";
                    
                    if(!localSetting.mode){
                        gpoint = gpoint + (gscore[localSetting.difficulty]*arclevel);
                        ( arclevel < 20 ) ? playGame() : gameEnd(true, gb);
                    }else{
                        gpoint = gscore[localSetting.difficulty];
                        gameEnd(true, gb);
                    }
                }
          } else {
                audWarn();
                showNextFail();
          }
    }
}
function isExist(k) {
    k = k.toUpperCase();
    var w = chrLeft.indexOf(k);
    if (w != -1) {
          chrLeft.splice(w, 1);
          typeWord(k);
          return true;
    }
    return false;
}
function typeWord(k) {
    for (i = 0; i < secph[index][0].length; i++) {
          if (secph[index][0][i].toUpperCase() == k) {
                qSel('.l', true, i).innerText = k;
          }
    }
}
function showNextFail() {
    fail++;
    if(fail == 1){
        if(localSetting.difficulty == 0){
            qSel('.key.hint', false, 0).className = (fail > 0) ? "key hint" : "key hint unsee";
        }
        qSel('.phold', false, 0).innerHTML = hold0+'gallow-off'+hold2+hold0+'f1'+hold2;
    }else if(fail == 10){
        qSel('.phold', false, 0).innerHTML = hold0+'knell'+hold2+hold0+'f10b'+hold2+hold0+'gallow-on'+hold2+hold0+'f10a'+hold2;
        audDie();
        (localSetting.difficulty == 3)?clearInt():"";
        sleep(7000).then(() => { gameEnd(false, 0); });
    }else if (fail > 1  || fail < 10){
        if(localSetting.difficulty == 1){
            qSel('.key.hint', false, 0).className = (fail > 4) ? "key hint" : "key hint unsee";
        }
        if(localSetting.difficulty == 1 || localSetting.difficulty == 0){
            hintlen = (fail > 6) ? 3 : 2;
        }
        qSel('.phold', false, 0).innerHTML = hold0+'gallow-off'+hold2+hold0+'f'+fail+hold2;
    }
}
function makeHappy(){
    if(fail == 0) return;
    else    qSel('.phold', false, 0).innerHTML = hold0+'gallow-off'+hold2+hold0+'c'+fail+hold2;
}
function newGame() {
    qSel('.gpercent span:nth-child(2)', false, 0).innerHTML = "0";
    qSel('.key.hint', false, 0).className = "key hint unsee";
    clearKeys();
    clearPty();
    createWord();
}
function clearInt(){
    clearInterval(cx);
    qSel('.gtimer', false, 0).className = "gtimer ptimer unsee";
}
function gameEnd(e,g) { 
    if(arclevel < 20 && arclevel > 0 && !localSetting.mode){
        gpoint = gpoint/arclevel;
    }
    (e)?audCheer():audBoo();
    var d = qSel('.verdict', false, 0);
    var c = qSel('.verdict .vwrap > div > p', true, -1); 
    // var point = 30; 
    d.setAttribute("data", e);
    var bonus = "";
    if(g != 0){
        bonus = " +"+g+" Bonus";
    }
    if(localSetting.mode){
        if (e) {     
            var pp = (fail==0)?"Perfect ":"";
            c[0].innerHTML = pp + res1[0];
            c[1].innerHTML = res2[0];
            c[2].innerHTML = gpoint+res3[0]+bonus;
        } else { 
            c[0].innerHTML = res1[1];
            c[1].innerHTML = res2[1]+secph[index][0].toUpperCase()+'"';
            c[2].innerHTML = res3[1];
        }
    }else {
        if(e){
            c[0].innerHTML = "Bravo! "+lvname[localSetting.difficulty]+" Arcade Completed";
            c[1].innerHTML = "Nothing else to beat";
            c[2].innerHTML = gpoint+res3[0]+bonus+" accummulated.";
        }else{
            c[0].innerHTML = res1[1]+" Arcade failed";
            c[1].innerHTML = res2[1]+secph[index][0].toUpperCase()+'"';
            c[2].innerHTML = gpoint+res3[0]+bonus+" accummulated so far.";
        }
    }
    gpoint += g;
    calScore(e, gpoint);
    d.className = "verdict";
}
function calScore(a,b){
    localSetting.tpoints +=  b;
    localSetting.tgames += 1;
    localSetting.nwords += (a)? 1 : 0;
    localSetting.fwords += (a)? 0 : 1;

    localSetting.hscore = (localSetting.hscore > gpoint) ? localSetting.hscore : gpoint;
    localSetting.pwords += (fail == 0) ? 1 : 0;

    localStorage.setItem('hngset', JSON.stringify(localSetting));
    
    qSel('.tp1', false, 0).innerHTML = localSetting.tpoints;
    qSel('.tp2', false, 0).innerHTML = localSetting.tgames;
    qSel('.tp3', false, 0).innerHTML = localSetting.nwords;
    qSel('.tp4', false, 0).innerHTML = localSetting.fwords;
    qSel('.tp5', false, 0).innerHTML = localSetting.hscore;
    qSel('.tp6', false, 0).innerHTML = localSetting.pwords;

    gpoint = 0; arclevel = 0; obons = 0;
}
function getBonus(){
    var bons = 0;
    if(fail == 0){
        bons += 20; 
    }
    if(localSetting.arena){
        bons += 10;
    }
    obons += bons;
    return obons;
}
function padUp(num, len) {
    return num.toString().padStart(len, '0');
}
function qSel(a, b, c) {
    if(b === false){
        return document.querySelector(a);
    }else{
        return (c == -1) ? document.querySelectorAll(a) : document.querySelectorAll(a)[c];
    }
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}
function lastPage(ele){
    var els= ['.home', '.verdict', '.help'];
    for(el of els) qSel(el, false, 0).classList.remove('prevv');
    qSel(ele, false, 0).classList.add('prevv');
}
function startGame() {
    if(localSetting.set){
        qSel('.home', false, 0).className = "home unsee";
        qSel('.verdict', false, 0).className = "verdict unsee";
        playGame();   
    }else{
        qSel('.verdict', false, 0).className = "verdict unsee";
        qSel('.home', false, 0).className = "home unsee";
        qSel('.modal', false, 0).className = "modal";
    }
}
function saveSetting(){
    if(!qSel('.chkinput', false, 0).checked){
        localSetting.set = qSel('.chkinput', false, 0).checked;
        localStorage.setItem('hngset', JSON.stringify(localSetting));
    }
    localSetting.mode =  qSel('.moderad', false, 0).checked;
    localSetting.difficulty = qSel('select', false, 0).value;
    localSetting.set = qSel('.chkinput', false, 0).checked;
    localSetting.sound = qSel('.chkswitch.snd', false, 0).checked;
    localSetting.arena = qSel('.chkswitch.arn', false, 0).checked;
    if (qSel('.chkinput', false, 0).checked) {
        localStorage.setItem('hngset', JSON.stringify(localSetting));
    }
    qSel('.modal', false, 0).className = "modal unsee";
    playGame();
}
function playGame(){
    if(!localSetting.mode){
        arclevel++;
        document.querySelector('body').style.background = (localSetting.arena) ? "url(img/img"+arclevel+".png)" : "rgb("+gbgs[arclevel-1]+")";
    }else{
        fr = Math.floor(Math.random()*20)+1;
        document.querySelector('body').style.background = (localSetting.arena) ? "url(img/img"+fr+".png)" : "rgb("+gbgs[fr-1]+")";
    }
    qSel('.gpercent span:nth-child(1)', false, 0).innerHTML = (localSetting.mode) ? "Slingshot" : "Arcade "+arclevel;
    //where all settings come into play
    newGame();
}
function showHelp(){
    qSel('.home', false, 0).className = "home unsee";
    qSel('.help', false, 0).className = "help";
}
function hideHelp(){
    qSel('.home', false, 0).className = "home";
    qSel('.help', false, 0).className = "help unsee";
}
function hideSetting(){
    var ele = qSel('.prevv', false, 0);
    ele.classList.remove('unsee');
    ele.classList.remove('prevv');
    qSel('.modal', false, 0).className = "modal unsee";
}
function hideVerdict(){
    qSel('.home', false, 0).className = "home";
    qSel('.verdict', false, 0).className = "verdict unsee";
}
function toSettings(){
    qSel('.modal', false, 0).className = "modal";
    qSel('.verdict', false, 0).className = "verdict unsee";
}
function toHome(){
    swal.fire(
        {title: "Are you sure?", text: "The game will be forfeited if you leave!", icon: "warning", showCancelButton: true, confirmButtonColor: '#3085d6', confirmButtonText: 'Proceed' }
        ).then((result) => {
            if(result.isConfirmed){
                calScore(false,0);        
                qSel('.home', false, 0).className = "home";
            }else {
               swal.fire('Game On!', "You can do this", 'success');
            }
        });
}
function getPercent(){
    qSel('.gpercent span:nth-child(2)', false, 0).innerHTML = ((wordlen-chrLeft.length)/wordlen*100).toFixed(0);
}