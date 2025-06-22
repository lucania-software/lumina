import { Data } from "@lucania/toolbox/shared";
import { Matrix4 } from "@lucania/vectorics";
import { BufferUsage } from "base/data/buffer/BufferUsage.js";
import { InstanceManager } from "base/data/GenericInstanceManager.js";
import { Buffer } from "../base/data/buffer/Buffer.js";
import { Model } from "../base/data/model/Model.js";
import { Renderer, RendererOptions } from "../base/Renderer.js";
import { WebGpuBuffer } from "./data/buffer/WebGpuBuffer.js";
import { WebGpuMaterial } from "./data/material/WebGpuMaterial.js";
import { WebGpuPipeline } from "./process/WebGpuPipeline.js";
import { BindGroupIndex } from "./WebGpuBindGroupIndex.js";
import { WebGpuGraphicsFactory } from "./WebGpuGraphicsFactory.js";

export interface WebGpuRendererOptions extends RendererOptions {
    gpu: GPU;
}

export type WebGpuEncoders = {
    command: GPUCommandEncoder,
    renderPass: GPURenderPassEncoder
};

export type WebGpuResources = {
    device: GPUDevice,
    context: GPUCanvasContext,
    encoders?: WebGpuEncoders
};

export class WebGpuRenderer extends Renderer {

    public readonly factory: WebGpuGraphicsFactory;
    public readonly gpu: GPU;

    protected _resources?: WebGpuResources;

    protected uniformsBindGroups: WeakMap<WebGpuPipeline, {
        bindGroup: GPUBindGroup,
        data: Float32Array,
        buffer: Buffer
    }>;

    /**
     * TO-DO: Instance manager bind groups need to be recreated if either the pipeline OR the buffer changes.
     * Currently, if the pipeline changes, the layout
     */
    protected instanceManagerBindGroups: WeakMap<Buffer, GPUBindGroup>;

    /**
     * { [Pipeline]: { [Resource]: BindGroup } }
     */
    protected bindGroups: WeakMap<WebGpuPipeline, WeakMap<object, GPUBindGroup>>;

    public constructor(options: WebGpuRendererOptions) {
        super(options);
        this.factory = new WebGpuGraphicsFactory(this);
        this.gpu = options.gpu;
        this.uniformsBindGroups = new WeakMap();
        this.instanceManagerBindGroups = new WeakMap();
        this.bindGroups = new WeakMap();
    }

    public async initialize(canvas: HTMLCanvasElement): Promise<void> {
        const context = canvas.getContext("webgpu");
        Data.assert(context !== null, "Failed to get WebGPU rendering context from canvas element.");
        const adapter = await this.gpu.requestAdapter();
        Data.assert(adapter !== null, "Failed to request WebGPU adapter.");
        const device = await adapter.requestDevice();

        this._resources = { device, context };
        const format = this.gpu.getPreferredCanvasFormat();
        const alphaMode = "premultiplied";
        this.context.configure({ device, format, alphaMode, usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
    }

    public begin(): void {
        const command = this.device.createCommandEncoder();
        const gpuTexture = this.resources.context.getCurrentTexture();
        const view = gpuTexture.createView();
        const renderPass = command.beginRenderPass({
            colorAttachments: [{
                clearValue: {
                    r: this.clearColor.red,
                    g: this.clearColor.green,
                    b: this.clearColor.blue,
                    a: this.clearColor.alpha
                },
                loadOp: "clear",
                storeOp: "store",
                view
            }]
        });
        this.resources.encoders = { command, renderPass };
    }

    public renderModel(model: Model, instanceCount: number = 1): void {
        const encoders = this.encoders;
        const pipeline = this.currentPipeline;
        if (this.debug) {
            Data.assert(model.mesh.adheresTo(pipeline.contract), "Mesh does not adhere to pipeline's vertex attribute contract!");
        }
        const uniformBindGroupEntry = this.uniformsBindGroups.get(pipeline);
        Data.assert(uniformBindGroupEntry !== undefined, `A bind group doesn't exist for the renderer's current pipeline.`);
        const { buffer, data, bindGroup: basicBindGroup } = uniformBindGroupEntry;
        const projectionMatrix = Matrix4.orthographic(0, this.context.canvas.width, 0, this.context.canvas.height, -1, 1);
        const viewMatrix = Matrix4.identity();

        data.set(model.transform.clone().transpose().data, 0);
        data.set(viewMatrix.clone().transpose().data, 16);
        data.set(projectionMatrix.clone().transpose().data, 32);
        data[48] = performance.now() / 1000;
        buffer.writeElements(data);

        const material = model.material as WebGpuMaterial;
        const vertexBuffer = model.vertexBuffer as WebGpuBuffer;
        const indexBuffer = model.indexBuffer as WebGpuBuffer | undefined;

        encoders.renderPass.setPipeline(pipeline.handle);
        encoders.renderPass.setBindGroup(BindGroupIndex.Basic, basicBindGroup);
        encoders.renderPass.setBindGroup(BindGroupIndex.Material, material.bindGroup);
        encoders.renderPass.setVertexBuffer(0, vertexBuffer.handle);
        if (model.mesh.indices === undefined) {
            encoders.renderPass.draw(model.mesh.vertices.length);
        } else {
            Data.assert(indexBuffer !== undefined, `Model had a mesh with indices defined, but lacked an index buffer!`);
            encoders.renderPass.setIndexBuffer(indexBuffer.handle, "uint16");
            encoders.renderPass.drawIndexed(model.mesh.indices.length, instanceCount);
        }
    }

    public renderInstances(instanceManager: InstanceManager): void {
        if (instanceManager.instances.length > 0) {
            let bindGroup = this.instanceManagerBindGroups.get(instanceManager.buffer);
            if (bindGroup === undefined) {
                const buffer = instanceManager.buffer as WebGpuBuffer;
                const pipeline = this.currentPipeline;
                bindGroup = this.device.createBindGroup({
                    layout: pipeline.handle.getBindGroupLayout(BindGroupIndex.Instanced),
                    entries: [
                        {
                            binding: 0,
                            resource: { buffer: buffer.handle }
                        }
                    ]
                });
                this.instanceManagerBindGroups.set(instanceManager.buffer, bindGroup);
            }
            this.encoders.renderPass.setBindGroup(BindGroupIndex.Instanced, bindGroup);
            this.renderModel(instanceManager.model, instanceManager.instances.length);
        }
    }

    public end(): void {
        const encoders = this.encoders;
        encoders.renderPass.end();
        const commands = encoders.command.finish();
        this.device.queue.submit([commands]);
    }

    public get pipeline(): WebGpuPipeline | undefined {
        return super.pipeline as WebGpuPipeline;
    }

    public set pipeline(pipeline: WebGpuPipeline | undefined) {
        super.pipeline = pipeline;
        if (pipeline !== undefined && !this.uniformsBindGroups.has(pipeline)) {
            const matrices = 4 * 4 * 3;
            const time = 1;
            const padding = 3;
            const data = new Float32Array(matrices + time + padding);
            const buffer = this.factory.createBuffer({
                size: data.byteLength,
                usages: [BufferUsage.Uniform, BufferUsage.CopyDestination]
            });
            const bindGroup = this.device.createBindGroup({
                layout: pipeline.handle.getBindGroupLayout(BindGroupIndex.Basic),
                entries: [
                    {
                        binding: 0,
                        resource: { buffer: buffer.handle }
                    }
                ]
            });
            this.uniformsBindGroups.set(pipeline, { bindGroup, buffer, data });
        }
    }

    public get currentPipeline(): WebGpuPipeline {
        Data.assert(
            this.pipeline !== undefined,
            "Attempted to render without a pipeline set. " +
            "Did you call render() before setting a pipeline?"
        );
        return this.pipeline;
    }

    public get resources(): WebGpuResources {
        Data.assert(this._resources !== undefined, "Attempted to access GPU device before renderer initialization.");
        return this._resources;
    }

    public get encoders(): WebGpuEncoders {
        Data.assert(
            this.resources.encoders !== undefined,
            "Attempted to access GPU encoders before they were created. " +
            "Did you call Renderer.begin()?"
        );
        return this.resources.encoders;
    }

    public get device(): GPUDevice {
        return this.resources.device;
    }

    public get context(): GPUCanvasContext {
        return this.resources.context;
    }

}