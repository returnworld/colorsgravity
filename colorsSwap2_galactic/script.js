(() => {

    console.log("ALARM!!!");
    const config = {
        dotMinRad: 1,
        dotMaxRad: 10,
        massFactor: 0.002,
        defColor : 'rgba(150,255,255,0.9)',
        colorSwap: 500,
        smooth : 0.05,
        sphereRad : 350,
        bigDotRad : 80,
        mouseSize : 140
    }
    
    const TWO_PI = 2 * Math.PI;
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext("2d");

    let w,h,mouse,dots;
    let once = 1;

    class Dot {
        constructor(red,green,blue,constRed,constGreen,constBlue){
            this.pos = {x: mouse.x, y: mouse.y}
            this.vel = {x: 0, y: 0}
            this.rad = random(config.dotMinRad,config.dotMaxRad);
            this.mass = this.rad * config.massFactor;

            this.red = red;
            this.green = green;
            this.blue = blue;
            this.color = 'rgba('+red+','+green+','+blue+','+'0.9)' || config.defColor;
            this.constRed = constRed || false;
            this.constGreen = constGreen || false;
            this.constBlue = constBlue || false;
            this.constColor = {r:this.constRed, g:this.constGreen, b:this.constBlue};
           
        }
        update()
        {
            this.color = 'rgba('+this.red+','+this.green+','+this.blue+','+'0.9)';
            
        }
        isMove()
        {
            if(this.vel.x != 0 && this.vel.y !=0) return true;
            else return false;
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
                if(dist > (a.rad+b.rad)*7)
                {
                    continue;
                }
                
                if(a.isMove() && dist < (a.rad+b.rad)){

                    if(a.red>b.red){
                        let diff=a.red-b.red;
                        //if(!b.constRed)
                        b.red+=diff/config.colorSwap;
                        if(!a.constRed) 
                        a.red-=diff/config.colorSwap;                      
                    }
                    if(a.green>b.green)
                    {
                        let diff=a.green-b.green;
                        //if(!b.constGreen) 
                        b.green+=diff/config.colorSwap;
                        if(!a.constGreen) 
                        a.green-=diff/config.colorSwap; 
                    }
                    if(a.blue>b.blue)
                    {
                        let diff=a.blue-b.blue;
                        //if(!b.constBlue) 
                        b.blue+=diff/config.colorSwap;
                        if(!a.constBlue) 
                        a.blue-=diff/config.colorSwap; 
                    }

                    b.update(); 
                    a.update();                   
                }

                let gravity = a.mass+b.mass / dist*dist;
                let cf = colorDifference(a,b); if(cf==0) cf = 1;
                let force = 0;
                let attraction = 0; //притяжение
                let repulsion = 0; //отталкивание
                if(cf<=255*3 && a.constColor!==b.constColor)
                {                  
                    attraction = cf;
                }
                if(cf>=0)
                {                  
                    repulsion = -255*3/cf;
                }
                
                if(dist>1){
                    force = (attraction+repulsion)/Math.pow(dist,2);
                }
                //if(Math.trunc(dist) <= 0) console.log(dist);
                

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
        let difference = Math.trunc(Math.abs(redForce)+Math.abs(greenForce)+Math.abs(blueForce));
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
        
        dots.push(new Dot(0,0,0)); dots[0].rad = config.bigDotRad;
        //dots.push(new Dot(0,0,0,1,1,1)); dots[1].pos.x +=600;
        
        for(i = 0, t = 0; i < 300; i++) { 
            if(t>=3) t = 0;
            
            if(t==0) dots.push(new Dot(random(0,255),random(0,255),random(0,255),true,0,0)); 
            if(t==1) dots.push(new Dot(random(0,255),random(0,255),random(0,255),0,true,0)); 
            if(t==2) dots.push(new Dot(random(0,255),random(0,255),random(0,255),0,0,true)); 
            t++;
        }
        console.log(dots);
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