/**
 * Created by Diogo on 10/19/2015.
 */

/*******************************************************************************
 * Global constants
 *******************************************************************************/

var quadVertData = [
    1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0,-1.0, 0.0,   1.0,-1.0, 0.0,
];
var quadIndexData = [
    0, 1, 2,
    0, 3, 2
];
var quadNormalData = [
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
];
var quadUVData = [
    1.0,0.0,    0.0,0.0,    0.0, 1.0,    1.0, 1.0
];

//Cube vertex constant
var modelVertData = [
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0
];

var modelColorData = [
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0
];

var modelNormalData = [
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0
];

var modelUVData = [
    1.0,0.0,    0.0,0.0,    0.0, 1.0,    1.0, 1.0,
    1.0,0.0,    0.0,0.0,    0.0, 1.0,    1.0, 1.0,
    1.0,0.0,    0.0,0.0,    0.0, 1.0,    1.0, 1.0,
    1.0,0.0,    0.0,0.0,    0.0, 1.0,    1.0, 1.0,
    1.0,0.0,    0.0,0.0,    0.0, 1.0,    1.0, 1.0,
    1.0,0.0,    0.0,0.0,    0.0, 1.0,    1.0, 1.0
];

var modelVertIndices = [
    0, 1, 2,   0, 2, 3,
    4, 5, 6,   4, 6, 7,
    8, 9,10,   8,10,11,
    12,13,14,  12,14,15,
    16,17,18,  16,18,19,
    20,21,22,  20,22,23
];

/*******************************************************************************
 * Global variables
 *******************************************************************************/

var handler = null;

var customVertexShader;
var customFragmentShader;

var modelName = "objects/suzane.obj";

var loadedImages = [false, false, false, false, false];
var modelTexture = new Image();
var dustTexture = new Image();
var glossinessTexture = new Image();
var specularTexture = new Image();
var aoTexture = new Image();

var modelTextureName = "textures/Marble_BlackMarble_512_alb.png";
var dustTextureName = "textures/dust.png";
var modelGlossinessMapName = "textures/g.png";
var modelSpecularMapName = "textures/s.png";
var modelAOName = "textures/AO.png"

var eyeX = 3;
var eyeY = 3;
var eyeZ = 7;
var clippingNear = 1;
var clippingFar = 100;
var cubeRotX = 0;
var cubeRotY = 0;
var cubeRotZ = 0;
var canvas;

/*******************************************************************************
 * Main
 *******************************************************************************/

function main() {

    //Get the canvas
    canvas = document.getElementById('testCanvas');

    handler = new Handler(canvas);
    handler.Init();
    handler.clearColor = [0.3922,0.5843,0.9294,1.0];

    LoadShaderFile("VertexShader.vert", handler.gl.VERTEX_SHADER);
    LoadShaderFile("FragmentShader.frag", handler.gl.FRAGMENT_SHADER);
}

function Run(){
    var model = new DrawableObject(
        handler,
        modelVertData,
        modelVertIndices,
        modelNormalData,
        [0.0, 0.0, 0.0],
        [0.0, 0.0, 0.0],
        [1, 1, 1]
    );

    model.uvData = modelUVData;
    model.renderingMode = handler.gl.TRIANGLES;

    model.textureImages[0] = modelTexture;
    model.useTextures[0] = 0;

    model.singleColorValue = [0.7,0.7,0.7];

    model.texTiling = [4.0,4.0];

    model.defaultVertexShader = customVertexShader;
    model.defaultFragmentShader = customFragmentShader;

    model.specular = 0.5;
    model.rimLight = 0.5;

    var quad = new DrawableObject(
        handler,
        quadVertData,
        quadIndexData,
        quadNormalData,
        [0.0, 0.0, -0.1],
        [-90.0, 0.0, 0.0],
        [10, 10, 10]
    );

    quad.uvData = quadUVData;
    quad.renderingMode = handler.gl.TRIANGLES;
    quad.defaultVertexShader = customVertexShader;
    quad.defaultFragmentShader = customFragmentShader;
    quad.singleColorValue = [0.7,0.7,0.7];

    //Lights
    handler.ambientLightIntensity = 1;
    handler.ambientLightColor = [0.3,0.3,0.3];

    var lt = new Light();
    lt.color = [0.0, 1.0, 0.0];
    lt.position = [0.0, 1.0, 0.5];
    lt.intensity = 0.5;

    var ltt = new Light();
    ltt.lightType = Light.LIGHT_TYPE_SPOT;
    ltt.color = [1.0, 0.0, 1.0];
    ltt.position = [1.0, 0.5, 1.0];
    ltt.direction = [-1.0,-0.5,-1.0];
    ltt.intensity = 1.0;
    ltt.spotAngle = 20;
    ltt.spotDecay = 20.0;

    var lta = new Light();
    lta.lightType = Light.LIGHT_TYPE_DIRECTIONAL;
    lta.color = [1.0, 0.98, 0.92];
    lta.direction = [-1.0,-1.0,-1.0];
    lta.intensity = 0.8;

    handler.lights.push(lt);
    handler.lights.push(ltt);
    handler.lights.push(lta);


    SetAndDraw(model);
    setEvents(model);
}

/*******************************************************************************
 * Setup
 *******************************************************************************/

//Shader load functions
function LoadShaderFile(fileName, shader) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status != 404) {
            OnLoadShader(request.responseText, shader);
        }
    };

    request.open('GET', fileName, true);
    request.send();
}

function OnLoadShader(fileString, type) {
    if (type == handler.gl.VERTEX_SHADER)
        customVertexShader = fileString;
    else if (type == handler.gl.FRAGMENT_SHADER)
        customFragmentShader = fileString;

    if (customFragmentShader && customVertexShader) {
        LoadTextures();
    }
}

function LoadTextures(){
    modelTexture.onload = function(){ loadedImages[0] = true; onLoadedImage();};
    modelTexture.src = modelTextureName;

    dustTexture.onload = function(){ loadedImages[1] = true; onLoadedImage();};
    dustTexture.src = dustTextureName;

    glossinessTexture.onload = function(){ loadedImages[2] = true; onLoadedImage();};
    glossinessTexture.src = modelGlossinessMapName;

    specularTexture.onload = function(){ loadedImages[3] = true; onLoadedImage();};
    specularTexture.src = modelSpecularMapName;

    aoTexture.onload = function(){ loadedImages[4] = true; onLoadedImage();};
    aoTexture.src = modelAOName;
}

function onLoadedImage(){
    var ready = true;
    for(var i = 0; i < loadedImages.length; i++){
        if(!loadedImages[i])
            ready = false;
    }

    if(ready){
        if(modelName)
            LoadOBJModel(modelName);
        else
            Run();
    }

}

function LoadOBJModel(fileName){
    K3D.load(fileName, OnLoadModel);
}

function OnLoadModel(data){
    console.log("loaded");
    var model = K3D.parse.fromOBJ(data);
    console.log(model);

    modelVertIndices = [];
    modelVertData = K3D.edit.unwrap(model.i_verts, model.c_verts, 3);
    modelNormalData = K3D.edit.unwrap(model.i_norms, model.c_norms, 3);
    modelUVData = K3D.edit.unwrap(model.i_uvt, model.c_uvt, 2);

    for(var i = 0; i < model.i_verts.length; i++){
        modelVertIndices.push(i);
    }

    Run();
}

/*******************************************************************************
 * Events
 *******************************************************************************/

function setEvents(model){
    document.onkeydown = function(ev) {
        KeyDown(ev.keyCode, model);
    };

    var eyeXBox = document.getElementById("EyeX");
    eyeXBox.value = eyeX.toFixed(2);
    eyeXBox.onchange = function () {
        if(!isNaN(eyeXBox.value))
            eyeX = parseFloat(eyeXBox.value);
        SetAndDraw(model);
    };

    var eyeYBox = document.getElementById("EyeY");
    eyeYBox.value = eyeY.toFixed(2);
    eyeYBox.onchange = function () {
        if(!isNaN(eyeYBox.value))
            eyeY = parseFloat(eyeYBox.value);
        SetAndDraw(model);
    };

    var eyeZBox = document.getElementById("EyeZ");
    eyeZBox.value = eyeZ.toFixed(2);
    eyeZBox.onchange = function () {
        if(!isNaN(eyeZBox.value))
            eyeZ = parseFloat(eyeZBox.value);
        SetAndDraw(model);
    };

    var nearClipBox = document.getElementById("clipN");
    nearClipBox.value = clippingNear.toFixed(1);
    nearClipBox.onchange = function() {
        if(!isNaN(nearClipBox.value))
            clippingNear = parseFloat(nearClipBox.value);
        SetAndDraw(model);
    };

    var farClipBox = document.getElementById("clipF");
    farClipBox.value = clippingFar.toFixed(1);
    farClipBox.onchange = function() {
        if(!isNaN(farClipBox.value))
            clippingFar = parseFloat(farClipBox.value);
        SetAndDraw(model);
    };

    var cubeXBox = document.getElementById("ModelX");
    cubeXBox.value = cubeRotX.toFixed(2);
    cubeXBox.onchange = function () {
        if(!isNaN(cubeXBox.value))
            cubeRotX = parseFloat(cubeXBox.value);
        SetAndDraw(model);
    };

    var cubeYBox = document.getElementById("ModelY");
    cubeYBox.value = cubeRotY.toFixed(2);
    cubeYBox.onchange = function () {
        if(!isNaN(cubeYBox.value))
            cubeRotY = parseFloat(cubeYBox.value);
        SetAndDraw(model);
    };

    var cubeZBox = document.getElementById("ModelZ");
    cubeZBox.value = cubeRotZ.toFixed(2);
    cubeZBox.onchange = function () {
        if(!isNaN(cubeZBox.value))
            cubeRotZ = parseFloat(cubeZBox.value);
        SetAndDraw(model);
    };

    var specBox = document.getElementById("Specular");
    specBox.value = model.specular.toFixed(2);
    specBox.onchange = function () {
        if(!isNaN(specBox.value))
            model.specular = parseFloat(specBox.value);
        SetAndDraw(model);
    };

    var rimBox = document.getElementById("RimLight");
    rimBox.value = model.rimLight.toFixed(2);
    rimBox.onchange = function () {
        if(!isNaN(rimBox.value))
            model.rimLight = parseFloat(rimBox.value);
        SetAndDraw(model);
    };

    var dragging = false;         // Dragging or not
    var lastX = -1, lastY = -1;   // Last position of the mouse

    canvas.onmousedown = function(ev) {   // Mouse is pressed
        var x = ev.clientX, y = ev.clientY;
        // Start dragging if a moue is in <canvas>
        var rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            lastX = x; lastY = y;
            dragging = true;
        }
    };

    canvas.onmouseup = function(ev) { dragging = false; }; // Mouse is released

    canvas.onmousemove = function(ev) { // Mouse is moved

        var x = ev.clientX, y = ev.clientY;
        if (dragging) {
            var factor = 100/canvas.height; // The rotation ratio
            var dx = factor * (x - lastX);
            var dy = factor * (y - lastY);
            // Limit x-axis rotation angle to -90 to 90 degrees
            cubeRotY = Math.max(Math.min(cubeRotY + dy, 90.0), -90.0);
            cubeRotX = cubeRotX + dx;

            cubeRotX = cubeRotX % 360;
            cubeRotY = cubeRotY % 360;

            document.getElementById("ModelX").value = parseFloat(cubeRotX).toFixed(2);
            document.getElementById("ModelY").value = parseFloat(cubeRotY).toFixed(2);

            SetAndDraw(model);
        }
        lastX = x, lastY = y;
    };

    document.body.ontouchstart = function(e) {
        if (e && e.preventDefault) { e.preventDefault(); }
        if (e && e.stopPropagation) { e.stopPropagation(); }

        var touchobj = e.changedTouches[0];
        var x = touchobj.clientX, y = touchobj.clientY;
        // Start dragging if a moue is in <canvas>
        var rect = e.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            lastX = x; lastY = y;
            dragging = true;
        }

        return false;
    };

    document.body.ontouchmove = function(e) {
        if (e && e.preventDefault) { e.preventDefault(); }
        if (e && e.stopPropagation) { e.stopPropagation(); }

        var touchobj = e.changedTouches[0];
        var x = touchobj.clientX, y = touchobj.clientY;
        if (dragging) {
            var factor = 100/canvas.height; // The rotation ratio
            var dx = factor * (x - lastX);
            var dy = factor * (y - lastY);
            // Limit x-axis rotation angle to -90 to 90 degrees
            cubeRotY = Math.max(Math.min(cubeRotY + dy, 90.0), -90.0);
            cubeRotX = cubeRotX + dx;

            cubeRotX = cubeRotX % 360;
            cubeRotY = cubeRotY % 360;

            document.getElementById("ModelX").value = parseFloat(cubeRotX).toFixed(2);
            document.getElementById("ModelY").value = parseFloat(cubeRotY).toFixed(2);

            SetAndDraw(model);
        }
        lastX = x, lastY = y;

        return false;
    };

    document.body.ontouchend = function(ev) { dragging = false; };

}

function KeyDown(keyCode, model){
    var cameraSpeed = 0.2;
    var cubeSpeed = 2;

    switch(keyCode){
        case 37: //left
            eyeX -= cameraSpeed;
            break;
        case 38: //up
            eyeY += cameraSpeed;
            break;
        case 39: //right
            eyeX += cameraSpeed;
            break;
        case 40: //down
            eyeY -= cameraSpeed;
            break;
        case 65: //a
            cubeRotX -= cubeSpeed;
            break;
        case 87: //w
            cubeRotY += cubeSpeed;
            break;
        case 68: //d
            cubeRotX += cubeSpeed;
            break;
        case 83: //s
            cubeRotY -= cubeSpeed;
            break;
        default :
            return;
    }


    cubeRotX = cubeRotX % 360;
    cubeRotY = cubeRotY % 360;

    document.getElementById("EyeX").value = parseFloat(eyeX).toFixed(2);
    document.getElementById("EyeY").value = parseFloat(eyeY).toFixed(2);
    document.getElementById("ModelX").value = parseFloat(cubeRotX).toFixed(2);
    document.getElementById("ModelY").value = parseFloat(cubeRotY).toFixed(2);

    SetAndDraw(model);
}

/*******************************************************************************
 * Draw Everything
 *******************************************************************************/

function SetAndDraw(model){
    handler.lookPostition = [eyeX, eyeY, eyeZ];
    handler.projMatrix.setPerspective(30, canvas.width/canvas.height, clippingNear, clippingFar);
    model.rotation = [cubeRotY, cubeRotX, cubeRotZ];
    handler.DrawAll();
}