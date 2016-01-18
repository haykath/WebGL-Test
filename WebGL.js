/**
 * Created by Diogo on 10/18/2015.
 */
/** Disclaimer: I hate JS. Yeah. */

var deg2rad = 0.0174533;

/*******************************************************************************
 * DrawableObject
 *******************************************************************************/

var DrawableObject = function (handler, vertexData, vertexIndices, normalData, position, rotation, scale) {
    if (!handler || !vertexData || !vertexIndices || !normalData) {
        console.log("Invalid DrawableObject constructor arguments");
        return;
    }

    if (!handler.initialized) {
        console.log("Tried to add object to an uninitialized handler");
        return;
    }

    this.handler = handler;
    this.gl = handler.gl;

    this.useDefaultDrawFunction = true;

    this.defaultVertexShader = this.handler.defaultVertexShader;
    this.defaultFragmentShader = this.handler.defaultFragmentShader;

    this.customVertexShader = "";
    this.customFragmentShader = "";
    this.useCustomShaders = false;

    this.vertexData = vertexData;
    this.indexData = vertexIndices;
    this.normalData = normalData;

    this.uvData = null;

    this.textureImages = [null, null, null, null, null, null, null, null];
    this.useTextures = [0, 0, 0, 0, 0, 0, 0, 0];
    this.texTiling = [1.0, 1.0];

    this.colorData = null;
    this.singleColorValue = [1.0, 1.0, 1.0, 1.0];
    this.useSingleColor = true;

    this.specular = 0.0;
    this.rimLight = 0.0;

    this.position = position;
    this.rotation = rotation;
    this.scale = scale;

    this.vertexCount = 0;
    this.vertexBufferData = null;

    this.renderingMode = this.gl.TRIANGLES;

    handler.objects.push(this);
};

/** Sets up vertex and index buffer
 * @return bool
 * */
DrawableObject.prototype.SetupBuffers = function () {
    var a_Position = this.gl.getAttribLocation(this.gl.program, "a_Position");
    var a_VertexColor = this.gl.getAttribLocation(this.gl.program, "a_VertexColor");
    var a_Normal = this.gl.getAttribLocation(this.gl.program, "a_Normal");
    var a_TexCoord = this.gl.getAttribLocation(this.gl.program, "a_TexCoord");
    if (a_VertexColor < 0 || a_Position < 0 || a_Normal < 0 || a_TexCoord < 0) {
        console.log("Failed to load variables from shader while setting up buffer");
        return false;
    }

    if(!this.colorData) this.useSingleColor = true;

    var vertexBufferData = [];
    for (var iVerts = 0; iVerts < this.indexData.length; iVerts++) {
        vertexBufferData.push(this.vertexData[3*iVerts]);
        vertexBufferData.push(this.vertexData[3*iVerts + 1]);
        vertexBufferData.push(this.vertexData[3*iVerts + 2]);
        vertexBufferData.push(1.0);

        if (this.useSingleColor == false) {
            vertexBufferData.push(this.colorData[3*iVerts]);
            vertexBufferData.push(this.colorData[3*iVerts + 1]);
            vertexBufferData.push(this.colorData[3*iVerts + 2]);
            vertexBufferData.push(1.0);
        }
        else {
            this.useSingleColor = true;
            vertexBufferData.push(this.singleColorValue[0]);
            vertexBufferData.push(this.singleColorValue[1]);
            vertexBufferData.push(this.singleColorValue[2]);
            vertexBufferData.push(this.singleColorValue[3]);
        }

        vertexBufferData.push(this.normalData[3*iVerts]);
        vertexBufferData.push(this.normalData[3*iVerts+1]);
        vertexBufferData.push(this.normalData[3*iVerts+2]);
        vertexBufferData.push(0.0);

        vertexBufferData.push(this.uvData[2*iVerts]);
        vertexBufferData.push(this.uvData[2*iVerts+1] );
    }


    var indexBufferData = new Uint16Array(this.indexData);
    this.vertexCount = indexBufferData.length;

    this.vertexBufferData = new Float32Array(vertexBufferData);
    var FSIZE = this.vertexBufferData.BYTES_PER_ELEMENT;

    //Create buffers
    var vertexBuffer = this.gl.createBuffer();
    var indexBuffer = this.gl.createBuffer();
    if (!vertexBuffer) {
        console.log("Failed to create vertex buffer");
        return false;
    }

    //binds vertex buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexBufferData, this.gl.STATIC_DRAW);

    //Sets position and color variables from vertex buffer
    this.gl.vertexAttribPointer(a_Position, 4, this.gl.FLOAT, false, 14 * FSIZE, 0);
    this.gl.enableVertexAttribArray(a_Position);

    this.gl.vertexAttribPointer(a_VertexColor, 4, this.gl.FLOAT, false, 14 * FSIZE, 4 * FSIZE);
    this.gl.enableVertexAttribArray(a_VertexColor);

    this.gl.vertexAttribPointer(a_Normal, 4, this.gl.FLOAT, false, 14 * FSIZE, 8 * FSIZE);
    this.gl.enableVertexAttribArray(a_Normal);

    this.gl.vertexAttribPointer(a_TexCoord, 2, this.gl.FLOAT, false, 14 * FSIZE, 12 * FSIZE);
    this.gl.enableVertexAttribArray(a_TexCoord);

    //Binds index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indexBufferData, this.gl.STATIC_DRAW);

    return true;
};

/** Sets up light and passes the
 * @return bool
 * */
DrawableObject.prototype.SetupLights = function() {

    var MAX_LIGHTS = 10;

    var pointLightCount = 0;
    var dirLightCount = 0;
    var spotLightCount = 0;

    for(var i = 0; i < this.handler.lights.length; i++){
        switch(this.handler.lights[i].lightType){

            //Point Light setup
            case Light.LIGHT_TYPE_POINT:
                if(pointLightCount >= MAX_LIGHTS)
                    break;

                var color = this.gl.getUniformLocation(this.gl.program, "u_pointLights[" + pointLightCount.toString() + "].color");
                var intensity = this.gl.getUniformLocation(this.gl.program, "u_pointLights[" + pointLightCount.toString() + "].intensity");
                var position = this.gl.getUniformLocation(this.gl.program, "u_pointLights[" + pointLightCount.toString() + "].position");

                if(color < 0 ||intensity < 0 || position < 0){
                    console.log("Error while getting point light uniform location");
                    return false;
                }

                this.gl.uniform3fv(color, this.handler.lights[i].color);
                this.gl.uniform1f(intensity, this.handler.lights[i].intensity);
                this.gl.uniform3fv(position, this.handler.lights[i].position);

                pointLightCount++;

                break;

            //Dir light setup
            case Light.LIGHT_TYPE_DIRECTIONAL:
                if(dirLightCount >= MAX_LIGHTS)
                    break;

                var color = this.gl.getUniformLocation(this.gl.program, "u_directionalLights[" + pointLightCount.toString() + "].color");
                var intensity = this.gl.getUniformLocation(this.gl.program, "u_directionalLights[" + pointLightCount.toString() + "].intensity");
                var direction = this.gl.getUniformLocation(this.gl.program, "u_directionalLights[" + pointLightCount.toString() + "].direction");

                if(color < 0 ||intensity < 0 || direction < 0){
                    console.log("Error while getting point light uniform location");
                    return false;
                }

                this.gl.uniform3fv(color, this.handler.lights[i].color);
                this.gl.uniform1f(intensity, this.handler.lights[i].intensity);
                this.gl.uniform3fv(direction, this.handler.lights[i].direction);

                dirLightCount++;

                break;

            //spot light setup
            case Light.LIGHT_TYPE_SPOT:
                if(spotLightCount >= MAX_LIGHTS)
                    break;

                var color = this.gl.getUniformLocation(this.gl.program, "u_spotLights[" + pointLightCount.toString() + "].color");
                var intensity = this.gl.getUniformLocation(this.gl.program, "u_spotLights[" + pointLightCount.toString() + "].intensity");
                var position = this.gl.getUniformLocation(this.gl.program, "u_spotLights[" + pointLightCount.toString() + "].position");
                var direction = this.gl.getUniformLocation(this.gl.program, "u_spotLights[" + pointLightCount.toString() + "].direction");
                var spotAngle = this.gl.getUniformLocation(this.gl.program, "u_spotLights[" + pointLightCount.toString() + "].spotAngle");
                var spotDecay = this.gl.getUniformLocation(this.gl.program, "u_spotLights[" + pointLightCount.toString() + "].spotDecay");

                if(color < 0 ||intensity < 0 || direction < 0 || position < 0 || spotAngle < 0 || spotDecay < 0){
                    console.log("Error while getting point light uniform location");
                    return false;
                }

                this.gl.uniform3fv(color, this.handler.lights[i].color);
                this.gl.uniform1f(intensity, this.handler.lights[i].intensity);
                this.gl.uniform3fv(position, this.handler.lights[i].position);
                this.gl.uniform3fv(direction, this.handler.lights[i].direction);
                this.gl.uniform1f(spotAngle, Math.cos(this.handler.lights[i].spotAngle * deg2rad));
                this.gl.uniform1f(spotDecay, this.handler.lights[i].spotDecay);

                spotLightCount++;

                break;
        }
    }

    var u_pointLightCount = this.gl.getUniformLocation(this.gl.program, "u_pointLightCount");
    var u_dirLightCount = this.gl.getUniformLocation(this.gl.program, "u_dirLightCount");
    var u_spotLightCount = this.gl.getUniformLocation(this.gl.program, "u_spotLightCount");

    var u_ambientLight = this.gl.getUniformLocation(this.gl.program, "u_ambientLight");
    var u_ambientIntensity = this.gl.getUniformLocation(this.gl.program, "u_ambientIntensity");
    var u_specular = this.gl.getUniformLocation(this.gl.program, "u_specular");
    var u_rimLight = this.gl.getUniformLocation(this.gl.program, "u_rimLight");

    if(u_pointLightCount < 0 || u_ambientLight < 0 || u_ambientIntensity < 0){
        console.log("Error while loading light related variables");
        return false;
    }

    this.gl.uniform1i(u_pointLightCount, pointLightCount);
    this.gl.uniform1i(u_dirLightCount, dirLightCount);
    this.gl.uniform1i(u_spotLightCount, spotLightCount);

    this.gl.uniform1f(u_ambientIntensity, this.handler.ambientLightIntensity);
    this.gl.uniform3fv(u_ambientLight, this.handler.ambientLightColor);
    this.gl.uniform1f(u_specular, this.specular);
    this.gl.uniform1f(u_rimLight, this.rimLight);

    return true;
};

/** Sets up the textures
 * @return bool
 * */
DrawableObject.prototype.SetupTextures = function(){

    var u_texTiling = this.gl.getUniformLocation(this.gl.program, "u_texTiling");
    this.gl.uniform2fv(u_texTiling, this.texTiling);

    if(this.useTextures[0] > 0) {
        var tex0 = this.gl.createTexture();
        var u_Tex0 = this.gl.getUniformLocation(this.gl.program, "u_Textures[0]");
        var u_useTexture0 = this.gl.getUniformLocation(this.gl.program, "u_useTextures[0]");

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 0);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex0);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.textureImages[0]);
        this.gl.uniform1i(u_Tex0, 0);

        this.gl.uniform1i(u_useTexture0, this.useTextures[0]);
    }
    if(this.useTextures[1] > 0){
        var tex1 = this.gl.createTexture();
        var u_Tex1 = this.gl.getUniformLocation(this.gl.program, "u_Textures[1]");
        var u_useTexture1 = this.gl.getUniformLocation(this.gl.program, "u_useTextures[1]");

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 0);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex1);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.textureImages[1]);
        this.gl.uniform1i(u_Tex1, 1);

        this.gl.uniform1i(u_useTexture1, this.useTextures[1]);
    }
    if(this.useTextures[2] > 0){
        var tex2 = this.gl.createTexture();
        var u_Tex2 = this.gl.getUniformLocation(this.gl.program, "u_Textures[2]");
        var u_useTexture2 = this.gl.getUniformLocation(this.gl.program, "u_useTextures[2]");

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 0);
        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex2);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.textureImages[2]);
        this.gl.uniform1i(u_Tex2, 2);

        this.gl.uniform1i(u_useTexture2, this.useTextures[2]);
    }
    if(this.useTextures[3] > 0){
        var tex3 = this.gl.createTexture();
        var u_Tex3 = this.gl.getUniformLocation(this.gl.program, "u_Textures[3]");
        var u_useTexture3 = this.gl.getUniformLocation(this.gl.program, "u_useTextures[3]");

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 0);
        this.gl.activeTexture(this.gl.TEXTURE3);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex3);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.textureImages[3]);
        this.gl.uniform1i(u_Tex3, 3);

        this.gl.uniform1i(u_useTexture3, this.useTextures[3]);
    }
    if(this.useTextures[4] > 0){
        var tex4 = this.gl.createTexture();
        var u_Tex4 = this.gl.getUniformLocation(this.gl.program, "u_Textures[4]");
        var u_useTexture4 = this.gl.getUniformLocation(this.gl.program, "u_useTextures[4]");

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 0);
        this.gl.activeTexture(this.gl.TEXTURE4);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex4);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.textureImages[4]);
        this.gl.uniform1i(u_Tex4, 4);

        this.gl.uniform1i(u_useTexture4, this.useTextures[4]);
    }

    return true;

};

/** Sets up the transform, projection, look at and inverse transposed matrix
 * @return bool
 * */
DrawableObject.prototype.SetupMatrices = function(position, rotation, scale){
    var u_viewPosition = this.gl.getUniformLocation(this.gl.program, "u_viewPosition");
    var u_tformMatrix = this.gl.getUniformLocation(this.gl.program, "u_tformMatrix");
    var u_lookAtMatrix = this.gl.getUniformLocation(this.gl.program, "u_lookAtMatrix");
    var u_projMatrix = this.gl.getUniformLocation(this.gl.program, "u_projMatrix");
    var u_normalMatrix = this.gl.getUniformLocation(this.gl.program, "u_normalMatrix");

    if (u_tformMatrix < 0 || u_lookAtMatrix < 0 || u_projMatrix < 0 || u_normalMatrix < 0) {
        console.log("Failed to get tform and lookAt matrix uniform location");
        return false;
    }

    //Setup transformation matrix
    var transformationMatrix = new Matrix4();
    transformationMatrix.setIdentity();

    if (scale) {
        if (scale.length == 3)
            transformationMatrix.scale(scale[0], scale[1], scale[2]);
    }

    if(rotation){
        if (rotation.length == 3) {
            transformationMatrix.rotate(rotation[0], 1.0, 0.0, 0.0);
            transformationMatrix.rotate(rotation[1], 0.0, 1.0, 0.0);
            transformationMatrix.rotate(rotation[2], 0.0, 0.0, 1.0);
        }
    }

    if (position) {
        transformationMatrix.translate(position[0], position[1], position[2]);
    }

    var normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(transformationMatrix);
    normalMatrix.transpose();

    var viewPosition = new Vector3(this.handler.lookPostition);

    this.gl.uniformMatrix4fv(u_tformMatrix, false, transformationMatrix.elements);
    this.gl.uniformMatrix4fv(u_normalMatrix, false, normalMatrix.elements);
    this.gl.uniformMatrix4fv(u_lookAtMatrix, false, this.handler.lookAtMatrix.elements);
    this.gl.uniformMatrix4fv(u_projMatrix, false, this.handler.projMatrix.elements);
    this.gl.uniform3fv(u_viewPosition, viewPosition.elements);

    return true;
};

DrawableObject.prototype.DrawDefault = function (position, rotation, scale) {
    if (!this.handler.initialized) {
        console.log("Tried to draw utilizing an uninitialized handler");
        return;
    }

    if(!this.useCustomShaders){
        if (!initShaders(this.gl, this.defaultVertexShader, this.defaultFragmentShader)) {
            console.log("Failed to initialize default shaders");
            return;
        }
    }
    else{
        if (!initShaders(this.gl, this.customVertexShader, this.customFragmentShader)) {
            console.log("Failed to initialize custom shaders");
            return;
        }
    }

    if(!this.SetupMatrices(position, rotation, scale)){
        console.log("Failed to setup matrixes");
    }

    if (!this.SetupBuffers()) {
        console.log("Error setting up buffers");
        return;
    }

    if(!this.SetupLights()){
        console.log("Error while setting up lights");
        return;
    }

    if(this.useTextures.length == 8 && this.textureImages.length == 8){
        if(!this.SetupTextures()){
            console.log("Error while setting up textures");
            return;
        }
    }
    else{
        console.log("useTextures and textureImages arrays are not set correctly. Textures will not be used.")
    }

    this.gl.drawElements(this.renderingMode, this.vertexCount, this.gl.UNSIGNED_SHORT, 0);
};


/*******************************************************************************
 * Handler
 *******************************************************************************/

/** Constructor */
var Handler = function (canvas) {
    this.canvas = canvas;
    this.gl = null;

    this.objects = [];

    this.defaultVertexShader = null;
    this.defaultFragmentShader = null;

    this.clearColor = [0.0, 0.0, 0.0, 1.0];
    this.initialized = false;

    this.lookPostition = [0.0,0.0,0.0];
    this.lookAtPoint = [0.0, 0.0, 0.0];
    this.upDirection = [0.0,1.0,0.0];

    this.lights = [];

    this.ambientLightColor = [1.0,1.0,1.0];
    this.ambientLightIntensity = 0.2;

    this.lookAtMatrix = new Matrix4();
    this.lookAtMatrix.setLookAt(
        this.lookPostition[0], this.lookPostition[1], this.lookPostition[2],
        this.lookAtPoint[0], this.lookAtPoint[1], this.lookAtPoint[2],
        this.upDirection[0], this.upDirection[1], this.upDirection[2]
    );

    this.projMatrix = new Matrix4();
    this.projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 0.0, 2.0);
};

/** Init function. This should be called before attempting to draw anything. *
 *  @return bool
 **/
Handler.prototype.Init = function () {
    this.gl = getWebGLContext(this.canvas);

    if (!this.canvas) {
        console.log("Failed to get WebGL context.");
        return false;
    }

    this.initialized = true;
    return true;
};

Handler.prototype.UpdateLookAtMatrix = function(){
    this.lookAtMatrix.setLookAt(
        this.lookPostition[0], this.lookPostition[1], this.lookPostition[2],
        this.lookAtPoint[0], this.lookAtPoint[1], this.lookAtPoint[2],
        this.upDirection[0], this.upDirection[1], this.upDirection[2]
    );
};

/** Clears the WebGL context viewport */
Handler.prototype.Clear = function () {
    if (!this.initialized) {
        console.log("Tried to clear screen on an uninitialized handler");
        return;
    }
    this.gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
};

Handler.prototype.DrawAll = function () {
    if (!this.initialized) {
        console.log("Tried to draw utilizing an uninitialized handler");
        return;
    }

    this.lookAtMatrix.setLookAt(
        this.lookPostition[0], this.lookPostition[1], this.lookPostition[2],
        this.lookAtPoint[0], this.lookAtPoint[1], this.lookAtPoint[2],
        this.upDirection[0], this.upDirection[1], this.upDirection[2]
    );

    this.Clear();

    this.gl.enable(this.gl.DEPTH_TEST);

    for (var iObj = 0; iObj < this.objects.length; iObj++) {
        this.objects[iObj].DrawDefault(this.objects[iObj].position, this.objects[iObj].rotation, this.objects[iObj].scale);
    }
};

Handler.prototype.LoadShaderFile = function (fileName, shader) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status != 404) {
            OnLoadShader(request.responseText, shader);
        }
    };

    request.open('GET', fileName, true);
    request.send();
};

Handler.prototype.OnLoadShader = function (fileString, type) {
    if (type == this.gl.VERTEX_SHADER)
        this.defaultVertexShader = fileString;
    else if (type == this.gl.FRAGMENT_SHADER)
        this.defaultFragmentShader = fileString;

    if (this.defaultVertexShader && this.defaultFragmentShader)
        this.initialized = true;
};

/*******************************************************************************
 * Light
 *******************************************************************************/

var Light = function(){
    this.lightType = Light.LIGHT_TYPE_POINT;
    this.intensity = 1.0;
    this.color = [0.0,0.0,0.0];

    //Point
    this.position = [0.0, 0.0, 0.0];

    //Spot and directional
    this.direction = [0.0, -0.5, -0.5];

    //Directional
    this.spotAngle = 20.0;
    this.spotDecay = 0.0;
};

Light.LIGHT_TYPE_POINT = 0;
Light.LIGHT_TYPE_DIRECTIONAL = 1;
Light.LIGHT_TYPE_SPOT = 2;
