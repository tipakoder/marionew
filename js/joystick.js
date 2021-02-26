//!!!-->ДЖОЙСТИК<--!!!
var canvas = document.getElementById("viewport");
var joystk_canvas = document.getElementById('joystickcanvas')
var joystk_ctx = joystk_canvas.getContext('2d')
var rect, backdragger
var max_rad = 100
var joystick_multiplyer = 0
var is_joystick_movement = false 
var joystick = {
    dimension:{
        width:  document.getElementById('joystickcanvas').width,
        height: document.getElementById('joystickcanvas').height
    },
    position_origin:{ //Исходная позиция
        x: document.getElementById('joystickcanvas').width/2,
        y: document.getElementById('joystickcanvas').height/2
    },
    position_imposed:{
        x: document.getElementById('joystickcanvas').width/2,
        y: document.getElementById('joystickcanvas').height/2
    },
    offset: { 
        x:0,
        y:0
    },
    color: "#800",
    backgroundColor: "#111"
}

function joystk_draw(){
    joystk_ctx.fillStyle = joystick.backgroundColor;
    joystk_ctx.fillRect(0, 0, canvas.width, canvas.height);
   
    //Макс. радиус    
    joystk_ctx.strokeStyle = joystick.color;
    joystk_ctx.beginPath();
    joystk_ctx.arc(joystick.position_origin.x, joystick.position_origin.y, max_rad, 0, 2*Math.PI);
    joystk_ctx.fill();
    joystk_ctx.stroke();

    //Кнопка джойстика 
    joystk_ctx.fillStyle = joystick.color;
    joystk_ctx.strokeStyle = joystick.color;
    joystk_ctx.beginPath();
    joystk_ctx.arc(joystick.position_imposed.x, joystick.position_imposed.y, 40, 0, 2*Math.PI);
    joystk_ctx.fill();
    joystk_ctx.stroke();
}

function joystk_action_touch_start(e){ //??? Можно убрать
    rect = joystk_canvas.getBoundingClientRect();
    joystk_action_touch_move(e);
}

function joystk_action_touch_move(e){
    is_joystick_movement = true;
    
    joystick.offset.x = e.clientX || e.touches[0].clientX;
    joystick.offset.y = e.clientY || e.touches[0].clientY; 

    joystick.offset.x -= rect.left - joystick.position_origin.x;;
    joystick.offset.y -= rect.top - joystick.position_origin.y;
 
    
    joystick.position_imposed.x = joystick.offset.x - joystick.position_origin.x;
    joystick.position_imposed.y = joystick.offset.y - joystick.position_origin.y;
    let len = Math.sqrt(Math.pow(joystick.position_imposed.x  - joystick.position_origin.x, 2)+Math.pow( joystick.position_imposed.y - joystick.position_origin.y, 2));
    joystick_multiplyer = Math.abs((len - max_rad)/max_rad);

    if(joystick_multiplyer > 0.05){
        if(joystick.position_imposed.x - joystick.position_origin.x > 0){
            player.right = true;
            player.left = false;
        }else{
            player.left = true;
            player.right = false;
        }
    } else {
        player.left = false;
        player.right = false;
    }

    if(len > max_rad){
        joystick_multiplyer = 1;
        let angle = getAngle((joystick.position_imposed.x - joystick.position_origin.x)*joystick.position_origin.x, (joystick.position_imposed.y - joystick.position_origin.y)*joystick.position_origin.y);
        angle=angle-270;
        joystick.position_imposed.x =  max_rad * Math.cos(angle) +   joystick.position_origin.x;
        joystick.position_imposed.y =  max_rad * Math.sin(angle) +  joystick.position_origin.y;
    }  
    joystk_draw()
}
 
function joystk_action_touch_end(){
    clearInterval(backdragger)
    player.right = false;
    player.left = false;

    joystick.offset.x = 0;
    joystick.offset.y = 0;

    joystick.position_imposed.x = joystick.position_origin.x;
    joystick.position_imposed.y = joystick.position_origin.y;

    joystk_draw();
}

function getAngle(x, y){
    let angle = Math.atan2(x, y);
    return  -angle + (Math.PI*4 + Math.PI/2.23);
}

joystk_draw();

joystk_canvas.addEventListener('touchstart', joystk_action_touch_start, false);
joystk_canvas.addEventListener('touchmove', joystk_action_touch_move, false);
joystk_canvas.addEventListener('touchend', joystk_action_touch_end, false);