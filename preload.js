
preImages(["img/c1.png", "img/c2.png", "img/c3.png", "img/c4.png", "img/c5.png", "img/c6.png", "img/c7.png", "img/c8.png", "img/c9.png", "img/f1.png", "img/f2.png", "img/f3.png", "img/f4.png", "img/f5.png", "img/f6.png", "img/f7.png", "img/f8.png", "img/f9.png", "img/f10a.png", "img/f10b.png", "img/gallow-off.png", "img/gallow-on.png", "img/img1.png", "img/img2.png", "img/img3.png", "img/img4.png", "img/img5.png", "img/img6.png", "img/img7.png", "img/img8.png", "img/img9.png", "img/img10.png", "img/img11.png", "img/img12.png", "img/img13.png", "img/img14.png", "img/img15.png", "img/img16.png", "img/img17.png", "img/img18.png", "img/img19.png", "img/img20.png"]);
// preSongs(["msc/AftertheRain.mp3", "msc/boo.mp3", "msc/cheer.mp3", "msc/click.mp3", "msc/gallows.mp3", "msc/warn.mp3"]);

function preImages(imgs){
    preImages.list = (!preImages.list) ? [] : '';
    var list = preImages.list;
    for(var i = 0; i<imgs.length; i++){
        var img = new Image();
        img.onload = function(){
            var index = list.indexOf(this);
            (index !== -1) ? list.splice(index,1) : '';
        }
        list.push(img);
        img.src = imgs[i];
    }
}

// function preSongs(auds){
//     // preSongs.list = (!preSongs.list) ? [] : '';
//     // var list = preSongs.list;
//     for(var i = 0; i<auds.length; i++){
//         var aud = new Audio(auds[i]);
//         aud.load();
//         // var aud = new Audio();
//         // aud.onload = function(){
//         //     var index = list.indexOf(this);
//         //     (index !== -1) ? list.splice(index,1) : '';
//         // }
//         // list.push(aud);
//         // aud.src = auds[i];

//         // preSongs(["msc/AftertheRain.mp3", "msc/ThroughtheArbor.mp3", "msc/SundialDreams.mp3", "msc/TheEnchantedGarden.mp3", "msc/Butterfly.mp3", "msc/StrawHats.mp3", "msc/AnotherRealm.mp3", "msc/WaterLillies.mp3", "msc/FairyWings.mp3", "msc/PaperClouds.mp3", "msc/boo.mp3", "msc/cheer.mp3", "msc/click.mp3", "msc/gallows.mp3", "msc/warn.mp3"]);
//     }
// }

