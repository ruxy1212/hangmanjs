
preImages(["img/c1.png", "img/c2.png", "img/c3.png", "img/c4.png", "img/c5.png", "img/c6.png", "img/c7.png", "img/c8.png", "img/c9.png", "img/f1.png", "img/f2.png", "img/f3.png", "img/f4.png", "img/f5.png", "img/f6.png", "img/f7.png", "img/f8.png", "img/f9.png", "img/f10a.png", "img/f10b.png", "img/gallow-off.png", "img/gallow-on.png", "img/img1.webp", "img/img2.webp", "img/img3.webp", "img/img4.webp", "img/img5.webp", "img/img6.webp", "img/img7.webp", "img/img8.webp", "img/img9.webp", "img/img10.webp", "img/img11.webp", "img/img12.webp", "img/img13.webp", "img/img14.webp", "img/img15.webp", "img/img16.webp", "img/img17.webp", "img/img18.webp", "img/img19.webp", "img/img20.webp"]);

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

