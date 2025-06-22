import { Pipeline } from "../../process/Pipeline.js";
import { Uniform } from "../uniform/Uniform.js";
import { Texture } from "./Texture.js";

export interface MaterialOptions {
    pipeline: Pipeline;
    textures?: Texture[];
    uniforms?: Uniform[];
};

export abstract class Material {

    public readonly textures: Texture[];
    public readonly uniforms: Map<string, Uniform>;

    public constructor(options: MaterialOptions) {
        this.textures = options.textures ?? [];
        this.uniforms = new Map();
        if (options.uniforms !== undefined) {
            options.uniforms.forEach((uniform) => this.uniforms.set(uniform.name, uniform));
        }
    }

}