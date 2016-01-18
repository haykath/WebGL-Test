#define MAX_POINT_LIGHTS 10
#define MAX_DIRECTIONAL_LIGHTS 10
#define MAX_SPOT_LIGHTS 10
#define GAUSSIAN_CONSTANT 1.0

precision highp float;
varying vec4 v_VertexColor;
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec2 v_TexCoord;

uniform vec3 u_viewPosition;
uniform vec3 u_ambientLight;
uniform float u_ambientIntensity;
uniform float u_specular;
uniform float u_rimLight;
uniform vec2 u_texTiling;

struct PointLight {
    vec3 color;
    float intensity;
    vec3 position;
};

uniform PointLight u_pointLights[MAX_POINT_LIGHTS];
uniform int u_pointLightCount;

struct DirectionalLight {
    vec3 color;
    float intensity;
    vec3 direction;
};

uniform DirectionalLight u_directionalLights[MAX_DIRECTIONAL_LIGHTS];
uniform int u_dirLightCount;

struct SpotLight {
    vec3 color;
    float intensity;
    vec3 position;
    vec3 direction;

    float spotAngle;
    float spotDecay;
};

uniform SpotLight u_spotLights[MAX_SPOT_LIGHTS];
uniform int u_spotLightCount;

//Textures
uniform int u_useTextures[8]; //0 alb 1 dust 2 gloss 3 spec 4 ao
uniform sampler2D u_Textures[8]; //1 use tiling 2 no tiling

//Function definitions
void loadTextures(out vec4 loadedTextures[8]);
float saturate(float value);
vec3 CookTorrance(vec3 normal, vec3 light, vec3 view, float NdotV, vec3 diffuse, vec3 specular, float intensity);
void backFaceCulling(float NdotV);
float saturate(float value);
vec3 saturate(vec3 value);

//Main code
void main(){
    vec4 textureColors[8];
    loadTextures(textureColors);

    vec3 normal = normalize(v_Normal);
	vec3 viewDirection = normalize(u_viewPosition - v_Position);

	float NdotV = dot(normal, viewDirection);
	backFaceCulling(NdotV);
    NdotV = saturate(NdotV);

    vec4 albedo = v_VertexColor*textureColors[0];
    vec3 ct_color = vec3(0.0,0.0,0.0);

    //Lights
    for(int i = 0; i < MAX_POINT_LIGHTS; i++){

        vec3 lightDirection = u_pointLights[i].position - v_Position;
        float attenuation = 1.0 / length(lightDirection);
        lightDirection = normalize(lightDirection);

        vec3 diffuse = albedo.rgb * u_pointLights[i].color;

        ct_color += max(CookTorrance(normal, lightDirection, viewDirection, NdotV, diffuse, u_pointLights[i].color, u_pointLights[i].intensity*attenuation), 0.0);
	}

	for(int i = 0; i < MAX_DIRECTIONAL_LIGHTS; i++){

        vec3 lightDirection = -u_directionalLights[i].direction;
        float attenuation = 1.0;
        lightDirection = normalize(lightDirection);

        vec3 diffuse = albedo.rgb * u_directionalLights[i].color;

        ct_color += max(CookTorrance(normal, lightDirection, viewDirection, NdotV, diffuse, u_directionalLights[i].color, u_directionalLights[i].intensity*attenuation), 0.0);
    }

	for(int i = 0; i < MAX_SPOT_LIGHTS; i++){
            vec3 lightDirection = u_spotLights[i].position - v_Position;
            float attenuation = 1.0 / length(lightDirection);
            lightDirection = normalize(lightDirection);

            vec3 spotDirection = normalize(u_spotLights[i].direction);
            float intensity = dot(-lightDirection, spotDirection);
            if(intensity > u_spotLights[i].spotAngle){
                intensity = saturate(pow(intensity, u_spotLights[i].spotDecay)*u_spotLights[i].intensity*attenuation);
                vec3 diffuse = albedo.rgb * u_spotLights[i].color;

                ct_color += max(CookTorrance(normal, lightDirection, viewDirection, NdotV, diffuse, u_spotLights[i].color, intensity), 0.0);
    	    }
    }

	//ambient calculation
    vec3 ambient = u_ambientIntensity * u_ambientLight * albedo.rgb;

	gl_FragColor = vec4(ambient + saturate(ct_color), 1.0);
}

void loadTextures(out vec4 loadedTextures[8]){
    for(int i = 0; i < 8; i++){
    		if(u_useTextures[i] == 1){
                loadedTextures[i] = texture2D(u_Textures[i], v_TexCoord*u_texTiling);
    		}
    		else if(u_useTextures[i] == 2){
    		    loadedTextures[i] = texture2D(u_Textures[i], v_TexCoord);
    		}
    		else{
    		    loadedTextures[i] = vec4(1.0,1.0,1.0,1.0);
    		}
    }
}

void backFaceCulling(float NdotV){
    if(NdotV < 0.0)
        discard;
}

float saturate(float value)
{
    return clamp(value, 0.0, 1.0);
}

vec3 saturate(vec3 value)
{
    return clamp(value, 0.0, 1.0);
}

float CT_Geometric(float NdotL, float NdotH, float NdotV, float VdotH){
    float geo_num = 2.0*NdotH;

    float geo_b = (geo_num * NdotL) / VdotH;
    float geo_c = (geo_num * NdotV) / VdotH;

    return min(1.0, min(geo_b, geo_c));
}

float CT_Roughness_Gauss(float rough_sq, vec3 normal, vec3 half_v){
    float alpha = acos(dot(normal, half_v));
    float roughness = GAUSSIAN_CONSTANT * exp(-(alpha / rough_sq));
    return roughness;
}

float CT_Fresnel(float VdotH){
    float fresnel = pow(1.0 - VdotH, 5.0);
    fresnel *= (1.0 - u_rimLight);
    fresnel += u_rimLight;
    return fresnel;
}

vec3 CookTorrance(vec3 normal, vec3 light, vec3 view, float NdotV, vec3 diffuse, vec3 specular, float intensity){
    vec3 half_v = normalize(light + view);

    float NdotL = saturate(dot(normal, light));
    float NdotH = saturate(dot(normal, half_v));
    float VdotH = saturate(dot(view, half_v));

    float r_sq = u_specular*u_specular;

    float geo = CT_Geometric(NdotL, NdotH, NdotV, VdotH);
    float rough = CT_Roughness_Gauss(r_sq, normal, half_v);
    float fresnel = CT_Fresnel(VdotH);

    float rs_num = fresnel * geo * rough;
    float rs_den = NdotV * NdotL;
    float rs = rs_num/rs_den;

    //Diffuse factor correction
    diffuse *= max(0.0, (1.0-u_rimLight));	
	
    vec3 final = intensity * max(0.0, NdotL) * (specular*rs + diffuse);

    return final;
}