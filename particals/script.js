(() => {

    console.log("ALARM!!!");
  
    const TWO_PI = 2 * Math.PI;
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext("2d");

    let w,h;
    let particles = [];
    let emitters = [];
    let fields = [];
    let objectSize = 0;
    let particleSize = 2;
    let midX = canvas.width / 2;
    let midY = canvas.height / 2; 
    let textalpha1 = textalpha2 = textalpha3 = 0;
    let date = new Date();

    function update()
    {
        addNewParticles();
        plotParticles(canvas.width, canvas.height);
    }
    
    let maxParticles = 5000; // Эксперимент! 20 000 обеспечит прекрасную вселенную
    let emissionRate = 4; // количество частиц, излучаемых за кадр

    function addNewParticles() {
        // прекращаем, если достигнут предел
        if (particles.length > maxParticles) return;

        // запускаем цикл по каждому излучателю
        for (let i = 0; i < emitters.length; i++) {

            // согласно emissionRate, генерируем частицы
            for (let j = 0; j < emissionRate; j++) {
            particles.push(emitters[i].emitParticle());
            }

        }
    }
    function plotParticles(boundsX, boundsY) {
        // Новый массив для частиц внутри холста
        let currentParticles = [];
        let newtime = new Date();
      
        for (let i = 0; i < particles.length; i++) {
          let particle = particles[i];
          let pos = particle.position;
          let deltatime = newtime-particles[i].time;
      
          // Если частица за пределами, то пропускаем её и переходим к следующей
          if (pos.x < 0 || pos.x > boundsX || pos.y < 0 || pos.y > boundsY) continue;
          if (particles[i].alpha <= 0) continue;
          if (deltatime >= 20000) continue;
      
          // Перемещение частицы
          particle.move();
          particle.submitToFields(fields);
          // Добавление частицы в массив частиц внутри холста
          currentParticles.push(particle);
        }
      
        // Замена глобального массива частиц на массив без вылетевших за пределы холста частиц
        particles = currentParticles;
    }

    function drawCircle(object) {
        ctx.fillStyle = object.drawColor;
        ctx.beginPath();
        ctx.arc(object.position.x, object.position.y, objectSize, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
    function drawParticles() {
        let newtime = new Date();
        

        // Запускаем цикл, который отображает частицы
        for (let i = 0; i < particles.length; i++) {
            let position = particles[i].position;
            let ps = particleSize;
            let deltatime = newtime-particles[i].time;

            if(deltatime > 16000) {
                particles[i].alpha-=0.003;//(particles[i].velocity.x < 0.1 || particles[i].velocity.y < 0.1)
                particles[i].size += 0.01;
            }
            // Задаём цвет частиц
            ctx.fillStyle = 'rgba('+(255-deltatime/100)+',0,'+deltatime/100+','+particles[i].alpha+')';
            // Рисуем квадрат определенных размеров с заданными координатами
            ctx.fillRect(position.x, position.y, particles[i].size, particles[i].size);
        }
    }
    function drawhellotext()
    {
        let newdate = new Date();
        let delta = newdate-date;
        if(delta>=2000)
        {
            if(textalpha1 <=1) textalpha1 +=0.002;
            
            ctx.font = "48px comic sans ms";
            ctx.fillStyle = "rgba(255,255,255,"+textalpha1+")";
            ctx.fillText("Ты", midX-470, midY+70);
        }
        if(delta>=4000)
        {
            if(textalpha2 <=1) textalpha2 +=0.002;
            
            ctx.font = "48px cursive";
            ctx.fillStyle = "rgba(255,255,255,"+textalpha2+")";
            ctx.fillText("моя...   ", midX+10, midY+70);
        }
        if(delta>=7500)
        {
            if(textalpha3 <=1) textalpha3 +=0.003;
            
            ctx.font = "48px fantasy";
            ctx.fillStyle = "rgba(255,255,255,"+textalpha3+")";
            ctx.fillText("                     <3 ღ ❥ ❤ ♥ ❣ ❢ ❦ ❧ ☜♡☞", midX+10, midY+70);
        }
        console.log(delta);
    }
    function draw()
    {   
        drawhellotext();
        drawParticles();
        fields.forEach(drawCircle);
        emitters.forEach(drawCircle);
    }

    class Vector2 {
        constructor(x,y)
        {
            this.x = x || 0;
            this.y = y || 0;
        }
        add(v2)
        {
            this.x += v2.x;
            this.y += v2.y;
        }
        getMagnitude()
        {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        getAngle()
        {
            return Math.atan2(this.y,this.x);
        }
        fromAngle(angle, magnitude)
        {
            return new Vector2(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
        }
        
    }
    class Particle {
        constructor(point, velocity, acceleration)
        {
            this.position = point || new Vector2(0, 0);
            this.velocity = velocity || new Vector2(0, 0);
            this.acceleration = acceleration || new Vector2(0, 0);
            this.time = new Date();
            this.size = particleSize;
            this.alpha = 0.9;
        }
        move()
        {
            // Добавить ускорение к скорости
            this.velocity.add(this.acceleration);

            // Добавить скорость к координатам
            this.position.add(this.velocity);
        }
        submitToFields(fields) {
            // стартовое ускорение в кадре
            let totalAccelerationX = 0;
            let totalAccelerationY = 0;
          
            // запускаем цикл по гравитационным полям
            for (let i = 0; i < fields.length; i++) {
              let field = fields[i];
          
              // вычисляем расстояние между частицей и полем
              let vectorX = field.position.x - this.position.x;
              let vectorY = field.position.y - this.position.y;
          
              // вычисляем силу с помощью МАГИИ и НАУКИ!
              let force = field.mass / Math.pow(vectorX*vectorX+vectorY*vectorY,1.5);
          
              // аккумулируем ускорение в кадре произведением силы на расстояние
              totalAccelerationX += vectorX * force;
              totalAccelerationY += vectorY * force;
            }
          
            // обновляем ускорение частицы
            this.acceleration = new Vector2(totalAccelerationX, totalAccelerationY);
          };
    }
    class Emitter{
        constructor(point, velocity, spread, color)
        {
            this.position = point; // Вектор
            this.velocity = velocity; // Вектор
            this.spread = spread || Math.PI / 32; // Возможный угол = скорость +/- разброс.
            this.drawColor = color || "#999";
        }
        emitParticle()
        {
            // Использование случайного угла для формирования потока частиц позволит нам получить своего рода «спрей»
            let angle = this.velocity.getAngle() + this.spread - (Math.random() * this.spread * 2);

            // Магнитуда скорости излучателя
            let magnitude = this.velocity.getMagnitude();

            // Координаты излучателя
            let position = new Vector2(this.position.x, this.position.y);

            // Обновлённая скорость, полученная из вычисленного угла и магнитуды
            let velocity = Vector2.prototype.fromAngle(angle, magnitude);

            // Возвращает нашу Частицу!
            return new Particle(position,velocity);
        } 
    }
    class Field{
        constructor(point, mass)
        {
            this.position = point;
            this.setMass(mass);
        }

        setMass(mass)
        {
            this.mass = mass || 100;
            this.drawColor = mass < 0 ? "#000000" : "#f0f";
        }
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
        midX = w / 2;
        midY = h / 2;
        emitters = [new Emitter(new Vector2(midX - 150, midY), Vector2.prototype.fromAngle(6, 2))];
        fields = [
            new Field(new Vector2(midX - 100, midY + 20), 160),
            new Field(new Vector2(midX - 300, midY + 20), 100),
            new Field(new Vector2(midX - 190, midY + 30), -35)
        ];
        mouse = {x: w/2, y: h/2, down: false}
    }

    function loop(){
        ctx.clearRect(0,0,w,h);

        update();
        draw();

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