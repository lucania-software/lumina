import { VertexAttributeDescriptor } from "../data/model/vertex/VertexAttribute.js";
import { Shader } from "./Shader.js";

export type VertexAttributeContract = readonly VertexAttributeDescriptor[];

export interface PipelineOptions {
    shaders: Shader[];
    contract: VertexAttributeContract;
}

export abstract class Pipeline {

    public readonly contract: VertexAttributeContract;
    public readonly shaders: readonly Shader[];
    
    public constructor(options: PipelineOptions) {
        this.contract = options.contract;
        this.shaders = Object.freeze(options.shaders);
    }

}