struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uvCoordinates: vec2<f32>,
    @location(3) vertexColor: vec4<f32>
}

struct VertexOutput {
    @builtin(position) clipPosition: vec4<f32>,
    @location(0) fragmentUVCoordinates: vec2<f32>,
    @location(1) fragmentColor: vec4<f32>,
    @location(2) fragmentNormal: vec3<f32>,
    @location(3) fragmentWorldPosition: vec3<f32>
}

struct Uniforms {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    time: f32
}

struct InstanceData {
    transform: mat4x4<f32>,
    textureBounds: vec4<f32>
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(1) @binding(0) var textureSampler: sampler;
@group(1) @binding(1) var textureData: texture_2d<f32>;
@group(2) @binding(0) var<storage, read> instanceUniforms: array<InstanceData>;

@vertex
fn vertex_main(
    input: VertexInput,
    @builtin(instance_index) instanceIndex: u32
) -> VertexOutput {
    var output: VertexOutput;

    let instance = instanceUniforms[instanceIndex];
    let worldPosition = uniforms.model * instance.transform * vec4<f32>(input.position, 1.0);
    let viewPosition = uniforms.view * worldPosition;
    var clipPosition = uniforms.projection * viewPosition;

    output.clipPosition = clipPosition;

    output.fragmentWorldPosition = input.position;
    output.fragmentUVCoordinates = input.uvCoordinates * instance.textureBounds.zw + instance.textureBounds.xy;
    output.fragmentColor = input.vertexColor;
    output.fragmentNormal = vec4<f32>(input.normal, 0.0).xyz;

    return output;
}

@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4<f32> {
    let normalizedNormal = normalize(input.fragmentNormal);

    let textureColor = textureSample(textureData, textureSampler, input.fragmentUVCoordinates);
    let finalColor = textureColor * input.fragmentColor;
    return finalColor;
}
