import { Data } from "@lucania/toolbox/shared";
import { Vertex } from "../../base/data/model/vertex/Vertex.js";
import { VertexAttributeScalar } from "../../base/data/model/vertex/VertexAttribute.js";
import { Pipeline, PipelineOptions } from "../../base/process/Pipeline.js";
import { WebGpuRenderer } from "../WebGpuRenderer.js";
import { WebGpuShader } from "./WebGpuShader.js";

export interface WebGpuPipelineOptions extends PipelineOptions {
    renderer: WebGpuRenderer;
    shaders: WebGpuShader[];
}

const VERTEX_ATTRIBUTE_SCALAR_MAPPING = {
    "float32": "float32",
    "unsigned_integer32": "uint32",
    "integer32": "sint32"
} as const;

type ScalarMapping = typeof VERTEX_ATTRIBUTE_SCALAR_MAPPING;

export class WebGpuPipeline extends Pipeline {

    public readonly renderer: WebGpuRenderer;
    public readonly handle: GPURenderPipeline;

    public constructor(options: WebGpuPipelineOptions) {
        super(options);
        this.renderer = options.renderer;
        const vertexShader = options.shaders.find((shader) => shader.type === "vertex");
        const fragmentShader = options.shaders.find((shader) => shader.type === "fragment");
        Data.assert(vertexShader !== undefined, "A vertex shader must be supplied to create a valid WebGPU pipeline.");

        const pipelineDescriptor: GPURenderPipelineDescriptor = {
            label: "Pristine Render Pipeline",
            vertex: {
                module: vertexShader.handle,
                entryPoint: vertexShader.entryPointFunctionName,
                buffers: [
                    {
                        attributes: this._createVertexAttributes(),
                        arrayStride: Vertex.getStride(this.contract),
                        stepMode: "vertex"
                    }
                ]
            },
            layout: "auto",
            primitive: {
                topology: "triangle-list"
            }
        };


        if (fragmentShader !== undefined) {
            pipelineDescriptor.fragment = {
                module: fragmentShader.handle,
                entryPoint: fragmentShader.entryPointFunctionName,
                targets: [{
                    format: this.renderer.gpu.getPreferredCanvasFormat(),
                    blend: {
                        color: {
                            srcFactor: "src-alpha",
                            dstFactor: "one-minus-src-alpha",
                            operation: "add",
                        },
                        alpha: {
                            srcFactor: "one",
                            dstFactor: "zero",
                            operation: "add",
                        },
                    },
                    writeMask: GPUColorWrite.ALL
                }]
            };
        }

        this.handle = options.renderer.device.createRenderPipeline(pipelineDescriptor);
    }

    public static getTranslatedScalar(scalar: VertexAttributeScalar): ScalarMapping[keyof ScalarMapping] {
        return VERTEX_ATTRIBUTE_SCALAR_MAPPING[scalar];
    }

    private _createVertexAttributes(): GPUVertexAttribute[] {
        const attributes: GPUVertexAttribute[] = [];
        let offset = 0;
        for (let location = 0; location < this.contract.length; location++) {
            const attribute = this.contract[location];
            attributes.push({
                shaderLocation: location,
                format: `${WebGpuPipeline.getTranslatedScalar(attribute.scalarType)}x${attribute.vectorSize}`,
                offset
            });
            offset += attribute.vectorSize * 4;
        }
        return attributes;
    }

}
