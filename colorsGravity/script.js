(() => {

    console.log("ALARM!!!");
    const config = {
        dotMinRad: 16,
        dotMaxRad: 30,
        massFactor: 0.002,
        defColor : 'rgba(150,255,255,0.9)',
        smooth : 0.05,
        sphereRad : 350,
        bigDotRad : 80,
        mouseSize : 120
    }
    
    const TWO_PI = 2 * Math.PI;
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext("2d");

    let w,h,mouse,dots;

    class Dot {
        constructor(red,green,blue,r){
            this.pos = {x: mouse.x, y: mouse.y}
            this.vel = {x: 0, y: 0}
            this.rad = r || random(config.dotMinRad,config.dotMaxRad);
            this.mass = this.rad * config.massFactor;

            this.red = red;
            this.green = green;
            this.blue = blue;
            this.color = 'rgba('+red+','+green+','+blue+','+'0.9)' || config.defColor;
            
        }

        draw(x , y){
            this.pos.x = x || this.pos.x + this.vel.x;
            this.pos.y = y || this.pos.y + this.vel.y;
            createCircle(this.pos.x, this.pos.y, this.rad, true, this.color);
            createCircle(this.pos.x, this.pos.y, this.rad, false, config.defColor);
        }
    }

    function updateDots(){
        for(let i = 0; i < dots.length; i++)
        {
            let acc = {x: 0, y: 0}
            for(let j = 0; j < dots.length; j++)
            {
                if (i==j) continue;
                let [a, b] = [dots[i], dots[j]];

                let delta = {x: b.pos.x - a.pos.x, y: b.pos.y - a.pos.y}
                let dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y) || 1;
                let gravity = a.mass+b.mass / dist*dist;
                //let force = (dist - (a.rad + b.rad)) / dist * b.mass;
                let cf = colorDifference(a,b);
                let force = gravity*cf/1000;
                if(cf == 0) cf = 1;
                if(cf <= 255*3/2)
                {
                    let ff = 1000/cf;
                    force = -ff*(a.mass+b.mass)/dist;
                }
                //console.log(force);
                if(dist > (a.rad+b.rad)*17)
                {
                    force = 0 ;
                }

                if(j==0){
                    if(dist < config.mouseSize)
                    force = (dist - config.mouseSize)*b.mass;
                    else force = 0;
                }
                acc.x += delta.x * force;
                acc.y += delta.y * force;
            }

            dots[i].vel.x = dots[i].vel.x * config.smooth + acc.x * dots[i].mass;
            dots[i].vel.y = dots[i].vel.y * config.smooth + acc.y * dots[i].mass;
        }
        dots.map(e=> e == dots[0] ? e.draw(mouse.x, mouse.y) : e.draw());
    }
    function colorDifference(a,b)
    {
        let aColors = {r:a.red, g:a.green, b:a.blue};
        let bColors = {r:b.red, g:b.green, b:b.blue};
        let redForce = aColors.r-bColors.r;
        let greenForce = aColors.g-bColors.g;
        let blueForce = aColors.b-bColors.b;
        let difference = Math.abs(redForce)+Math.abs(greenForce)+Math.abs(blueForce);
        return difference;
    }


    function createCircle(x,y,rad,fill,color){
        context.fillStyle = context.strokeStyle = color;
        context.beginPath();
        context.arc(x,y,rad,0,TWO_PI);
        context.closePath();
        fill ? context.fill() : context.stroke();
    }

    function random(min,max){
        return Math.random() * (max-min) + min;
    }

    function init(){
        w = canvas.width = innerWidth;
        h = canvas.height = innerHeight;

        mouse = {x: w/2, y: h/2, down: false}
        dots = [];

        dots.push(new Dot(0,0,0, config.bigDotRad));
        for(i = 0; i < 222 ; i++) { 
            dots.push(new Dot(random(0,255),random(0,255),random(0,255))); 
            console.log("down", i);
        }
    }

    function loop(){
        context.clearRect(0,0,w,h);

        updateDots();

        window.requestAnimationFrame(loop);
    }

    init();
    loop();

    function setPos({layerX,layerY}){
        [mouse.x, mouse.y] = [layerX,layerY];
    }

    function isDown(){
        mouse.down = !mouse.down;
    }

    canvas.addEventListener('mousemove', setPos);
    window.addEventListener('mousedown', isDown);
    window.addEventListener('mouseup', isDown);
})();