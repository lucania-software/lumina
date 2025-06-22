import { Data } from "@lucania/toolbox/shared";
import { BufferUsage } from "base/data/buffer/BufferUsage.js";
import { InstanceManager, InstanceManagerOptions } from "../../base/data/InstanceManager.js";
import { WebGpuPipeline } from "../process/WebGpuPipeline.js";
import { BindGroupIndex } from "../WebGpuBindGroupIndex.js";
import type { WebGpuRenderer } from "../WebGpuRenderer.js";
import { WebGpuBuffer } from "./buffer/WebGpuBuffer.js";

export interface WebGpuInstanceManagerOptions extends InstanceManagerOptions {
    renderer: WebGpuRenderer;
    initialBufferSize?: number;
};

export class WebGpuInstanceManager extends InstanceManager {

    public readonly renderer: WebGpuRenderer;
    protected _data: Float32Array;
    protected _bindGroup: GPUBindGroup;
    private _buffer: WebGpuBuffer;

    public constructor(options: WebGpuInstanceManagerOptions) {
        super(options);
        this.renderer = options.renderer;
        this._data = new Float32Array();
        this._buffer = this.renderer.factory.createBuffer({
            size: options.initialBufferSize ?? 4096,
            usages: [BufferUsage.Storage, BufferUsage.CopyDestination]
        });
        this._bindGroup = this._createBindGroup();
    }

    public get buffer() {
        return this._buffer;
    }

    public render(): void {
        if (this.instances.length > 0) {
            this.renderer.encoders.renderPass.setBindGroup(BindGroupIndex.Instanced, this._bindGroup);
            this.renderer.renderModel(this._model, this.instances.length);
        }
    }

    public pack(): void {
        const matrixSize = 4 * 4 + 4;
        const length = this.instances.length * matrixSize;
        if (this._data.length !== length) {
            this._data = new Float32Array(length);
        }
        for (let i = 0; i < this.instances.length; i++) {
            let offset = matrixSize * i;
            const transformData = this.instances[i].transform.clone().transpose().data;
            const textureBoundsData = this.instances[i].textureBounds.components;
            this._data.set(transformData, offset);
            offset += transformData.length;
            this._data.set(textureBoundsData, offset);
            offset += textureBoundsData.length;
        }
        const maximumUniformBufferSize = this.renderer.device.limits.maxUniformBufferBindingSize;
        Data.assert(
            this._data.byteLength < maximumUniformBufferSize,
            [
                `${this.constructor.name} requires ${this._data.byteLength} bytes to represent data for ${this.instances.length} instances.`,
                `However, the maximum uniform buffer size for your "${this.renderer.device.adapterInfo.vendor}" GPU is ${maximumUniformBufferSize} bytes.`,
                "Consider batching fewer instances."
            ].join(" ")
        );
        if (this._buffer.size < this._data.byteLength) {
            const newSize = Math.min(Math.max(this._buffer.size * 2, this._data.byteLength), maximumUniformBufferSize);
            this._buffer.destroy();
            this._buffer = this.renderer.factory.createBuffer({
                size: newSize,
                usages: [BufferUsage.Storage, BufferUsage.CopyDestination]
            });
            this._bindGroup = this._createBindGroup();
        }
        this.buffer.writeElements(this._data);
    }

    private _createBindGroup() {
        const pipeline = this.pipeline as WebGpuPipeline;
        return this.renderer.device.createBindGroup({
            layout: pipeline.handle.getBindGroupLayout(BindGroupIndex.Instanced),
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.buffer.handle }
                }
            ]
        });
    }

}