import { Shader, ShaderOptions } from "../../base/process/Shader.js";
import { WebGpuRenderer } from "../WebGpuRenderer.js";

export interface WebGpuShaderOptions extends ShaderOptions {
    renderer: WebGpuRenderer;
}

export type WgslScalarType = "f32" | "i32" | "u32";
export type WgslVectorType = "vec2" | "vec3" | "vec4";

export class WebGpuShader extends Shader {

    public readonly renderer: WebGpuRenderer;
    public readonly handle: GPUShaderModule;

    public constructor(options: WebGpuShaderOptions) {
        super(options);
        this.renderer = options.renderer;
        this.handle = this.renderer.device.createShaderModule({ label: `Pristine "${options.type}" Shader`, code: options.source });
    }

}