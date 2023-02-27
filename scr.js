var gscore = [8,20,50,120], cx, lvname = ['Magician', 'Viserion', 'Inferno', 'Immortal'];
var keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", chrLeft = [], index = 0, fail = 0;
var hold0 = '<div style="background-image: url(img/', hold2 = '.png);"></div>';
var word = [
    ["HANGMAN", "A word guessing game", "That game you are playing right now."],
    ["Ruxy", "Best dev on earth", "About the creator of this game."],
    ["HTML", "Used to create web pages, starts with H.", "It's not a disease, it's a markup language."],
    ["CSS", "Styling language for web pages.", "The only thing harder than CSS is trying to pick a favorite color."],
    ["PHP", "Server-side scripting language.", "The language that makes programmers go 'What the heck is this error?'"],
    ["JAVASCRIPT", "Client-side scripting language for web.", "When in doubt, console.log it out."],
    ["JAVA", "Popular programming language.", "Coffee may keep you awake, but Java keeps the internet running."],
    ["GITHUB", "Web-based hosting service for version control.", "Where coding dreams come true, and merge conflicts come to die."],
    ["LOVE", "Four-letter word, feeling of strong affection.", "The ultimate bug that even a debugger can't fix."],
    ["DOCUMENT", "Record of information.", "When in doubt, read the manual... or just Google it."],
    ["PLAYGROUND", "Place for children to play.", "The sandbox for programmers where the only limit is your imagination."],
    ["RUN", "Physical activity involving moving quickly on foot.", "Code might run, but we'll never be able to escape from the inevitable syntax error."],
    ["CODE", "Set of instructions for computer.", "The art of transforming caffeine into error messages."],
    ["SAMSUNG", "South Korean electronics company.", "For those who want a phone that won't explode in their face."],
    ["SUPER MARIO", "Famous video game character.", "The original game where jumping over turtles was the ultimate goal."],
    ["STAR", "Bright, shining celestial object.", "When in doubt, wish upon a star... or just Google it."],
    ["CLOCK", "Time-keeping device.", "Time flies when you're debugging."],
    ["BINARY CLOCK", "Clock displaying time in binary form.", "When you need a clock that only nerds can read."],
    ["GIRL", "Female child or young woman.", "The ultimate mystery that even machine learning can't solve."],
    ["BOY", "Male child or young man.", "The best debugging partner when you need someone to blame."],
    ["FEMALE", "Woman or girl.", "The ultimate power-up that gives programmers the strength to code all night."],
    ["MALE", "Man or boy.", "The ultimate tool that helps programmers get the job done."],
    ["SMARTPHONE", "Mobile phone with advanced features.", "The ultimate device that we can't live without... unless it's out of battery."],
    ["MUG", "Cup with handle used for drinking hot beverages.", "The only way to keep your code warm and your coffee cold."],
    ["TELEPHONE", "Device used to communicate over distance.", "The ancient artifact that our grandparents used to call each other."],
    ["CAR", "Vehicle used for transportation on roads.", "The ultimate tool for getting to the coffee shop faster."],
    ["HORSE", "Domesticated mammal used for riding or racing.", "The original mode of transportation that beats rush hour traffic."],
    ["CAMERA", "Device used for taking photographs or filming.", "The ultimate tool for capturing those rare moments when your code finally works."],
    ["OLDER", "Comparative form of old.", "Code may age like fine wine, but old hardware ages like sour milk."],
    ["FOOTSTEP", "Sound made by someone walking.", "The only sound you hear when a programmer finally leaves their desk."],
    ["ENVELOPE", "Paper container for mailing letters.", "The only way to send a message that doesn't involve a keyboard."],
    ["SQUARE", "Shape with four equal sides and four right angles.", "The only shape that can be used to create anything, from a website to a spaceship."],
    ["HOUSE", "Building used for dwelling in.", "The ultimate workspace for programmers who work from home."],
    ["MEADOW", "Field of grass and wildflowers.", "The ultimate workspace for programmers who need a break from their screens."],
    ["BULL", "Male bovine animal.", "The ultimate symbol of a programmer's perseverance when dealing with bugs."],
    ["TOWEL", "Cloth used for drying or wiping.", "The ultimate accessory for programmers who need to wipe away their tears of frustration."],
    ["TIME", "Measured duration between events.", "The only thing that we can't add more of, no matter how much code we write."],
    ["SANDWICH", "Food item consisting of bread and filling.", "The ultimate fuel for programmers who need to code all night."],
    ["ONION", "Edible bulb used in cooking.", "The ultimate debugging tool that can make anyone cry."],
    ["BAG", "Hold the key to unlock the answer", "Hold your belongings, but don't forget to zip it up!"],
    ["BOOK", "Turn the pages to reveal the secret", "Open me up to learn something new."],
    ["PLATE", "Look for the missing piece", "I hold your food, but don't drop me!"],
    ["PERFUME", "Follow your nose to the solution", "A spritz of me will make you smell lovely."],
    ["PEN", "Ink the right path", "Use me to write down your thoughts and ideas."],
    ["BENCH", "Take a seat and think it through", "Sit down and take a break, but watch out for splinters!"],
    ["BLOCK", "Move the pieces to fit the puzzle", "Stack me up to build something great."],
    ["ELEPHANT", "Remember the details for the answer", "I'm grey and have a trunk, but I can't fit in your room."],
    ["COMMODE", "Search the drawers for the clue", "A fancy name for a toilet, but don't fall in!"],
    ["LAPTOP", "Crack the password for the answer", "I fit in your bag and let you work from anywhere."],
    ["CABLE", "Untangle the knot to uncover the answer", "Connect me to your device to get power or data."],
    ["SPOON", "Stir up the solution", "I'm used for eating soup or cereal, but don't slurp too loudly!"],
    ["HAND", "Use your fingers to solve it", "Wave hello or give a high five with me."],
    ["EAR", "Listen closely for the answer", "I help you hear, but be careful with loud noises."],
    ["PIERCE", "Look for the hole in the answer", "Put a hole in your skin for jewelry or body art."],
    ["DRESS", "Follow the fabric to the solution", "I cover your body and make you look fabulous."],
    ["BLANKET", "Wrap your mind around the answer", "Wrap me around you to stay warm and cozy."],
    ["SHOES", "Walk in the right direction for the answer", "Cover your feet and protect them from the ground."],
    ["CAT", "Chase the answer like a feline", "I'm a furry friend who loves to nap and play."],
    ["SAND", "Dig deep for the solution", "I'm found at the beach and in hourglasses."],
    ["LAVA", "Think hot for the answer", "I'm hot, molten rock that erupts from a volcano."],
    ["SHARK", "Swim towards the solution", "I'm a feared predator of the ocean."],
    ["DRAWER", "Open and discover the answer", "Pull me out to find what you're looking for."],
    ["FIGURE", "Count on the right answer", "I'm a small replica of a person or object."],
    ["DESK", "Organize your thoughts for the answer", "I'm a workspace where you get things done."],
    ["WIPER", "Clear the answer from the fog", "Clear the rain or snow off your windshield with me."],
    ["WATER", "Dive in for the answer", "I'm a transparent liquid that's essential for life."],
    ["TRUCK", "Follow the right path to the answer", "I'm a vehicle used for hauling heavy loads."],
    ["DOLL", "Play your way to the answer", "I'm a toy that's loved by children everywhere."],
    ["GUITAR", "Strum your way to the answer", "Strum me to make beautiful music."],
    ["DRUM", "Beat the answer out", "Beat me to keep the rhythm and make some noise."],
    ["PIANO", "Play the keys to unlock the answer", "Press my keys to create a beautiful melody."],
    ["PLATTER", "Serve up the answer", "Round, flat and holds food, don't drop it, you're screwed."],
    ["PUZZLE", "Put the pieces together for the answer", "1000 pieces, no edges, no idea where to start."],
    ["TIGER", "Roar your way to the answer", "Stripes, claws, and a roar, stay away, or you'll be tore."],
    ["BEAR", "Hibernate on the answer", "Furry, big and strong, run away, or be gone."],
    ["LINOLEUM", "Look down for the answer", "Smooth, shiny, and clean, but beware, it's quite mean."],
    ["STICKER", "Peel away for the answer", "Stuck to your shoe, your phone, and your car, never-ending annoyance, it will go far."],
    ["FOLDER", "Sort through for the answer", "Holds papers, bills, and notes, but can it hide my remote?"],
    ["FILE", "Organize for the answer", "Teeth that shred and slice, use with care, or pay the price."],
    ["LIST", "Check off the answer", "Check off each box, don't forget a task, or else chaos will unbox."],
    ["CLOCK", "Tick-tock towards the answer", "Tick-tock, it never stops, but if it does, then your day will flop."],
    ["FOX", "Hunt for the answer", "Sleek, sly, and cunning, don't trust it, it's always running."],
    ["BUTTERFLY", "Fly towards the answer", "Pretty, colorful, and light, but if you touch it, it'll take flight."],
    ["KEYBOARD", "Type out the solution", "Typing away, click-clack, don't forget to save."],
    ["CAMERA", "Focus on the answer", "Captures moments, smiles, and frowns, don't blink, or you'll miss the crown."],
    ["LENS", "Zoom in on the answer", "Zoom in, zoom out, focus, or doubt."],
    ["SMARTPHONE", "Swipe to the answer", "Can't live without, always in your hand, never a pout."],
    ["FISHNET", "Catch the answer", "Mesh, holes, and string, but what's caught, it will bring."],
    ["STOCKING", "Pull out the answer", "Nylon, lycra, and silk, but who wears it, you must think."],
    ["CLOTH", "Wipe away for the answer", "Wipe, clean, and shine, but it also holds a design."],
    ["TURTLE", "Slow and steady wins the answer", "Slow and steady, but don't get too close, or it'll be quite deadly."],
    ["FISH", "Swim towards the answer", "Swim, jump, and splash, but once caught, it's time for a flash."],
    ["BONE", "Connect the pieces for the answer", "Hard, strong, and white, but don't break it, or you'll take flight."],
    ["ICE", "Freeze the answer in your mind", "Cold, slippery, and hard, but if it melts, it's a liquid shard."],
    ["GROUND", "Dig deep for the answer", "Where feet go when skydiving without a parachute."],
    ["SALAD", "Toss around for the answer", "A deceptive bowl of leafy greens masking crouton treasures."],
    ["BIKE", "Pedal towards the solution", "A two-wheeled beast that's faster than walking but not by much."],
    ["PLANE", "Fly towards the answer", "A metal bird that defies gravity, and common sense."],
    ["TRAIN", "Chug along towards the solution", "A long, metal worm that hisses and carries people to work."],
    ["METRO", "Navigate the tracks to the answer", "Where strangers get uncomfortably close and share each other's scents."],
    ["SHIP", "Sail towards the answer", "A floating city where the captain is king, and seasickness reigns."],
    ["VEST", "Wear your way to the answer", "A piece of clothing that's almost a shirt, but not quite."],
    ["PHOTO", "Picture the solution", "A time-travel device that captures a single moment forever."],
    ["STRING", "Follow the thread to the answer", "The feline's preferred toy, and the human's bane of existence."],
    ["CHAIN", "Link together for the answer", "A metal serpent that binds, and sometimes chokes."],
    ["BRACELET", "Clasp onto the answer", "A shiny, decorative handcuff for the wrist."],
    ["COLLAR", "Snap onto the answer", "A necklace for the dog, but a symbol of oppression for humans."],
    ["FUR", "Brush off for the answer", "Nature's cozy coat, but animal rights activists' mortal enemy."],
    ["DISH", "Serve up the answer", "A plate for food, but also a potential projectile in arguments."],
    ["SINK", "Drain out the answer", "Where water goes to die, and dishes go to soak."],
    ["COOKER", "Heat up the solution", "The magic box that transforms raw ingredients into deliciousness."],
    ["AQUARIUM", "Dive in for the answer", "A prison for fish, and a source of joy for humans."],
    ["WOOL", "Knit together the answer", "The sheep's gift to humans, and a source of itchiness."],
    ["PILLOW", "Rest your mind on the answer", "The soft, fluffy cushion for the head and dreams."],
    ["CAP", "Top off the answer", "A hat that covers the top of the head but leaves the ears exposed."],
    ["BAND", "Play your way to the answer", "A musical group or a strip of elastic, depending on context."],
    ["BANDANA", "Tie the solution together", "The cowboy's preferred headwear, and the pirate's backup eyepatch."],
    ["DRAGON", "Slay the answer", "A mythical creature that breathes fire, and hoards gold."],
    ["SHELL", "Crack open for the answer", "A protective home for snails, and a souvenir from the beach."],
    ["GLOBE", "Spin around for the answer", "A tiny, spinning model of the world, with no actual countries visible."],
    ["MICROSCOPE", "Zoom in on tiny details", "A magnifying glass for science nerds and forensic analysts."],
    ["JACKET", "Outerwear for cooler weather", "A coat that's not warm enough for winter but too warm for spring."],
    ["PICTURE", "Captured memory on display", "A flat, paper representation of reality, that's never quite accurate."],
    ["KARMA", "Consequence of actions, good or bad", "The universal system of justice, that often takes a lifetime to work."],
    ["RIPE", "Perfectly matured fruit or idea", "The perfect point of readiness for fruits, and jokes."],
    ["RUBBER", "Elastic material, great for bouncing", "The bouncy, stretchy material that makes everything fun."],
    ["COUNTER", "Place to exchange goods or services", "The place where cash goes to disappear, and questions go to be answered."],
    ["CASES", "Hold valuable items for protection", "The boxes that keep things safe, and lawyers in business."],
    ["SWITCH", "Toggle on and off with ease", "The button that turns things on, and off, and back on again."],
    ["ILO", "International Labour Organization, promoting workers' rights", "A made-up word that sounds like an island, but isn't."],
    ["BROOM", "Sweep away debris with bristles", "The witch's preferred mode of transportation, and the housekeeper's tool of choice."],
    ["SHEET", "Thin layer for covering or writing", "The thing that covers the bed, and ghosts use to scare people."],
    ["LEAF", "Green and photosynthetic part of a plant", "The thing that falls off trees in autumn, and gets stuck in gutters"],
];
var res1 = ["Way to Go!", "Oops!"], res2 = ["You found the word", 'The word was "'], res3 = [" Points", "Better luck next time"];
var gbgs = ["255, 255, 255", "222, 222, 222", "231, 218, 218", "231, 225, 218", "231, 231, 218", "224, 231, 218", "218, 231, 223", "218, 231, 230", "218, 222, 231", "224, 218, 231", "231, 218, 230", "216, 180, 180", "216, 199, 180", "215, 216, 180", "194, 216, 180", "180, 216, 193", "180, 208, 216", "180, 186, 216", "192, 180, 216", "216, 180, 211"];
audioFiles = ["AftertheRain.mp3", "ThroughtheArbor.mp3", "SundialDreams.mp3", "TheEnchantedGarden.mp3", "Butterfly.mp3", "StrawHats.mp3", "AnotherRealm.mp3", "WaterLillies.mp3", "FairyWings.mp3", "PaperClouds.mp3"]
var localSetting = {mode: true, difficulty: 0, set: false, sound: false, arena: false, tpoints: 0, tgames: 0, nwords: 0, fwords: 0, hscore: 0, pwords: 0};
var wordlen = 0, arclevel = 0, gpoint = 0, obons = 0, msc = 0;
var audio = new Audio("msc/"+audioFiles[msc]);

const settings = JSON.parse(localStorage.getItem('hngset'));
if (settings) {
    localSetting = settings;
}else{
    dset = {mode: true, difficulty: 0, set: false, sound: false, arena: false, tpoints: 0, tgames: 0, nwords: 0, fwords: 0, hscore: 0, pwords: 0};
    localStorage.setItem('hngset', JSON.stringify(dset));    
}
if(localSetting.sound){ playAudio(); qSel('.chkswitch.snd', false, 0).checked = true; }
else { pauseAudio(); qSel('.chkswitch.snd', false, 0).checked = true; }
qSel('.chkinput', false, 0).checked = (localSetting.set) ? true : false ; 

function fader(fadee){
    var fadeOut = setInterval(function(){
        if(!fadee.style.opacity) fadee.style.opacity = 1;
        if(fadee.style.opacity > 0) fadee.style.opacity -= 0.15;
        else { 
            clearInterval(fadeOut); 
            fadee.style.display = "none"; 
            document.querySelector('.circ').style.display = "none"; }
    }, 50);
}
function preLoader(){
    fader(document.querySelector('.main')); 
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
function initMsc(){
    audio.volume = 0.15;

    audio.addEventListener('canplaythrough', () => {
        audio.play().catch(e => {
            window.addEventListener('click', () => {
                audio.play();
            }, {once: true});
        });
    });
    
    audio.addEventListener('ended', function(){
        msc++;
        if(msc<audioFiles.length){
            audio.src = "msc/"+audioFiles[msc];
            audio.play();
        }else{
            audio.src = "msc/"+audioFiles[0];
            audio.play();
        }
    }, false);
}
function switchAud(){
    audio.muted = (qSel('.chkswitch.snd', false, 0).checked) ? false : true;
}
function playAudio(){
    audio.muted = false;
}
function pauseAudio(){
    audio.muted = true;
}
function audClick(){
    let clk = new Audio("msc/click.mp3");
    clk.volume = 0.2;
    clk.play();
}
function audWarn(){
    let wrn = new Audio("msc/warn.mp3");
    wrn.volume = 0.15;
    wrn.play();
}
function audBoo(){
    let boo = new Audio("msc/boo.mp3");
    boo.play();
}
function audCheer(){
    let chr = new Audio("msc/cheer.mp3");
    chr.play();
}
function audDie(){
    let die = new Audio("msc/gallows.mp3");
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
        var rn = Math.floor(Math.random()*2);
        Swal.fire('Hint:', word[index][rn+1]);
    }
    kb.appendChild(k);
}

function createWord() {
    var chrs = qSel('.word', false, 0);
    chrs.innerHTML = "";
    index = Math.floor(Math.random() * word.length);
    wordlen = word[index][0].length;
    for (i = 0; i < word[index][0].length; i++) {
        var w = word[index][0][i].toUpperCase();
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
    for (i = 0; i < word[index][0].length; i++) {
          if (word[index][0][i].toUpperCase() == k) {
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
        sleep(7000).then(() => { gameEnd(false, 0); });
    }else if (fail > 1  || fail < 10){
        if(localSetting.difficulty == 1){
            qSel('.key.hint', false, 0).className = (fail > 4) ? "key hint" : "key hint unsee";
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
            c[1].innerHTML = res2[1]+word[index][0].toUpperCase()+'"';
            c[2].innerHTML = res3[1];
        }
    }else {
        if(e){
            c[0].innerHTML = "Bravo! "+lvname[localSetting.difficulty]+" Arcade Completed";
            c[1].innerHTML = "Nothing else to beat";
            c[2].innerHTML = gpoint+res3[0]+bonus+" accummulated.";
        }else{
            c[0].innerHTML = res1[1]+" Arcade failed";
            c[1].innerHTML = res2[1]+word[index][0].toUpperCase()+'"';
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
        document.querySelector('body').style.background = (localSetting.arena) ? "url(img/img"+arclevel+".webp)" : "rgb("+gbgs[arclevel-1]+")";
    }else{
        fr = Math.floor(Math.random()*20)+1;
        document.querySelector('body').style.background = (localSetting.arena) ? "url(img/img"+fr+".webp)" : "rgb("+gbgs[fr-1]+")";
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
        {title: "Are you sure?", text: "The game will be forfeited if you leave!", icon: "warning", showCancelButton: true, confirmButtonColor: '#3085d6', confirmButtonText: 'Proceed', dangerMode: true }
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