////////////////////////////
//Global Vars
///////////////////////////
var canvas = document.getElementById("canvas");//canvas//decleared in media.js
var ctx = canvas.getContext("2d");//drawing object
//mouse coordinates
var mouse = {
    x: 0,                   //x coord
    y: 0,                   //y coord
    radius: 6,              //mouse detection radius
    inCanvas: false,        //hovering over canvas
    clickedCanvas: false    //clicked on canvas       
};
//active canvas tool
var activeTool = 'none';
//user Custom Shape
userShape = {
    points: [],         //points that connect shape
    adjustedPoints: [], //points adjusted for dimension changes
    finished: false,    //boolean of shape completion
    color: '#f00'       //shape line color
};

////////////////////////////
//Canvas
///////////////////////////
//Animate Canvas
function animate(){
    //background
    ctx.clearRect(0, 0, canvas.width, canvas.height);//clear background

    strokeShape(userShape);//draw user's shape

    activeToolLogic();//script for active tool

    //animationloop
    requestAnimationFrame(animate);
}
animate();

////////////////////////////
//Event Listeners
///////////////////////////
//move tool button click event
createActiveTool('move-points-tool', 'pointer');
//draw tool button click event
createActiveTool('draw-points-tool', 'crosshair');
//delete tool button click event
createActiveTool('delete-points-tool', 'not-allowed');

//On Cavnas Mouse Move
canvas.addEventListener('mousemove', function (event) {
    var rect = canvas.getBoundingClientRect();//canvas dimensions
    mouse.x = event.clientX - rect.left;//update mouseX
    mouse.y = event.clientY - rect.top;//update mouseY
});
//On mouse in canvas
canvas.onmouseover = function (e) {
    mouse.inCanvas = true;
};
//On mouse leave canvas
canvas.onmouseout = function (e) {
    mouse.inCanvas = false;
};
//On mouse click in canvas
canvas.addEventListener('click', function(){
    mouse.clickedCanvas = true;//simulate canvas click event
});

//coordinate tool button
document.getElementById('coord-tool').addEventListener('click', function(){
    var result = ''+userShape.points.length+'<br>';//outputed to user
    //loop through each point
    for(i=0; i < userShape.points.length ; i++){
        //save each point
        result+= Math.trunc(userShape.points[i].x) + ' ' + Math.trunc(userShape.points[i].y) + '<br>';
    }
    //Insert result to html overlay
    console.log(result);
    document.getElementById('shape-coordinates-result').innerHTML = result;//add result to overlay
    showPopup('shape-coordinates-overlay');//show overlay
});

// - Keyboard Shortcuts
document.addEventListener("keydown", function (event) {
    //ctrl-z or meta-z
    if ((event.ctrlKey  && event.code === "KeyZ") || (event.metaKey  &&  event.code === "KeyZ") && activeTool === 'draw-points-tool') {
        //cancel finished shape
        if(userShape.finished)
            userShape.finished = false;
        //remove last point
        else{
            userShape.points.pop();
            console.log(userShape);
        }
    }
});

////////////////////////////
//Functions
///////////////////////////
// - Runs function for tool in use
function activeToolLogic(){
    if(activeTool === 'none'){
        return;//nothing happens
    }
    else if (activeTool === 'draw-points-tool'){
        drawToolLogic(mouse.clickedCanvas);
    }
    else if (activeTool === 'move-points-tool'){
        moveToolLogic(mouse.clickedCanvas);
    }
    else if (activeTool === 'delete-points-tool'){
        deleteToolLogic(mouse.clickedCanvas);
    }
    mouse.clickedCanvas = false;//set mouse as unclicked
}

// - Adds button click event & cursor change & sets active tool
function createActiveTool(id, cursor){
    var buttonElement = document.getElementById(id);//html button element
    //on button click
    buttonElement.addEventListener('click', function(){
        //Unselect last tool
        if(activeTool !== 'none'){
            document.getElementById(activeTool).style.backgroundColor = 'rgba(0, 0, 0, 0.49)';//revert active tool background
            canvas.style.cursor = 'default';//revert to old cursor
        }
        //Select tool if new
        if(activeTool !== id){
            activeTool = id;//change active tool
            canvas.style.cursor = cursor;//change to tool cursor
            buttonElement.style.backgroundColor = 'white';//set active background
        }
        //Confirm to unselect last tool
        else{
            activeTool = 'none';//update active tool
        }
    });
}

// - Logic for drawing tool
function drawToolLogic(canvasClicked){
    if(!userShape.finished){
        //on canvas clicked
        if(canvasClicked){
            //finish shape if clicked on first point
            if(userShape.points.length > 1 && mouseOnPoint(userShape.points[0]))
                userShape.finished = true;
            //user wants to add a point
            else{
                //adjust if media resize
                if(mediaIsShrunk){
                    userShape.points.push({
                        x: mouse.x * (originalMediaWidth/canvas.width),
                        y: mouse.y * (originalMediaHeight/canvas.height)
                    });
                }
                //add point normally
                else
                    userShape.points.push({x:mouse.x,y:mouse.y});//add new shape point
            }
            console.log(userShape.points);//log new shape array
        }

        //if over first point and ready to close shape
        if(userShape.points.length > 1 && mouseOnPoint(userShape.points[0])){
            console.log('over finisher point');
            drawCircle(userShape.points[0].x*(canvas.width/originalMediaWidth), userShape.points[0].y*(canvas.height/originalMediaHeight), 7, 2, '#00ff00', 'fill');
            drawCircle(userShape.points[0].x*(canvas.width/originalMediaWidth), userShape.points[0].y*(canvas.height/originalMediaHeight), 8, 2, '#fff', 'stroke');
        }

        //preview next shape line
        if(userShape.points.length > 0 && mouse.inCanvas){
            previewStroke(userShape.points[userShape.points.length-1]);//preview from last point in shape array
        }
    }
}

// - Logic for delete tool
function deleteToolLogic(canvasClicked){
    //preview movable points & which point mouse is over
    highlightPoints(userShape.points, 'yellow', function(focusedPoint){
        //if user wants to edit point being focused
        if(focusedPoint !== undefined && canvasClicked){
            userShape.points.splice(focusedPoint, 1);//delete selected point
            //if shape is not fully connected
            if(userShape.finished && userShape.points.length < 3)
                userShape.finished = false;//set shape as unfinished
        }
    });
}

// - Logic for move tool
var editingPoint;//point user is moving
function moveToolLogic(canvasClicked){
    //preview movable points & which point mouse is over
    highlightPoints(userShape.points, '#0000ff', function(focusedPoint){
        //if user clicks while editing point or leaves canvas
        if((editingPoint!== undefined && canvasClicked) || !mouse.inCanvas){
            editingPoint = undefined;//stop editing point
        }
        //if user wants to edit point being focused
        else if(focusedPoint !== undefined && canvasClicked){
            editingPoint = focusedPoint;//update point to edit
        }
    });

    //if editing point is set
    if(editingPoint !== undefined){
        userShape.points[editingPoint].x = mouse.x*(originalMediaWidth/canvas.width);//set point x to mouse.x
        userShape.points[editingPoint].y = mouse.y*(originalMediaHeight/canvas.height);//set point y to mouse.y
    }
}

// - Draws temporary line from last point
function previewStroke(point){
    ctx.beginPath();//start
    ctx.lineWidth = 2;
    ctx.strokeStyle = userShape.color;
    ctx.moveTo(point.x*(canvas.width/originalMediaWidth),point.y*(canvas.height/originalMediaHeight));//last point
    ctx.lineTo(mouse.x,mouse.y);//mouse pos
    ctx.stroke();//draw
}

// - Draws a shape from an array of coordinate objetcs
function strokeShape(shape){
    //more than 2+ points
    if(shape.points.length > 1){
        ctx.beginPath();//start
        ctx.lineWidth = 2;
        ctx.strokeStyle = userShape.color;
        ctx.lineJoin = 'round';
        //draw first point
        ctx.moveTo(shape.points[0].x*(canvas.width/originalMediaWidth), shape.points[0].y*(canvas.height/originalMediaHeight));
        //draw lines to other points
        for(var i = 1; i < shape.points.length; i++){
            ctx.lineTo(shape.points[i].x*(canvas.width/originalMediaWidth), shape.points[i].y*(canvas.height/originalMediaHeight));
        }
        //if shape finished
        if(shape.finished){
            ctx.closePath();//connect last points
            ctx.stroke();//draw
        }  
        //shape not finished
        else
            ctx.stroke();//finish drawing
    }
}

//Check if over point
function mouseOnPoint(point){
    //check if mouse is over point
    if(Math.pow(mouse.x-point.x*(canvas.width/originalMediaWidth),2) + Math.pow(mouse.y-point.y*(canvas.height/originalMediaHeight),2) < Math.pow(mouse.radius,2)){
        return true;
    }
}

function highlightPoints(points, color, callback){
    var pointIndex;//point sent to callback
    //check every point
    for(var i = 0; i < points.length; i++){
        //draw blue circle over point
        drawCircle(userShape.points[i].x*(canvas.width/originalMediaWidth), userShape.points[i].y*(canvas.height/originalMediaHeight), mouse.radius, 2, color, 'fill');
        //check if mouse is over a point
        if(mouseOnPoint(points[i])){
            drawCircle(userShape.points[i].x*(canvas.width/originalMediaWidth), userShape.points[i].y*(canvas.height/originalMediaHeight), mouse.radius+1, 2, '#0000ff', 'stroke');//draw outline
            pointIndex = i;//return array index
        }
    }
    callback(pointIndex);//pass data to callback
}

// - Draw Circle Outline
function drawCircle(x,y,radius,lineWidth, color, drawType){
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.style = color;
    ctx.fillStyle = color;
    ctx.arc(x,y,radius,0,2*Math.PI);//(x, y, radius, startAngle, endAngle
    if(drawType === 'stroke')
        ctx.stroke();
    else if(drawType === 'fill')
        ctx.fill();
}