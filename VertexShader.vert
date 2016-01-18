attribute vec4 a_Position; 
attribute vec4 a_VertexColor;
attribute vec4 a_Normal;
attribute vec2 a_TexCoord;

uniform mat4 u_tformMatrix;
uniform mat4 u_normalMatrix;
uniform mat4 u_lookAtMatrix;
uniform mat4 u_projMatrix;

varying vec4 v_VertexColor;
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_TexCoord;

void main(){
    vec4 vertexPosition = u_tformMatrix * a_Position;

    v_VertexColor = a_VertexColor;
    v_Normal = normalize(vec3(u_normalMatrix * a_Normal));
    v_Position = vec3(vertexPosition);
    v_TexCoord = a_TexCoord;

    gl_Position = u_projMatrix * u_lookAtMatrix * vertexPosition;
}