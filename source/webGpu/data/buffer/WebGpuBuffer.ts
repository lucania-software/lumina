import { BufferUsage } from "base/data/buffer/BufferUsage.js";
import { WebGpuRenderer } from "webGpu/WebGpuRenderer.js";
import { Buffer, BufferElements, BufferOptions } from "../../../base/data/buffer/Buffer.js";

export interface WebGpuBufferOptions extends BufferOptions {
    renderer: WebGpuRenderer;
}

export class WebGpuBuffer extends Buffer {

    public readonly renderer: WebGpuRenderer;
    public readonly handle: GPUBuffer;

    public constructor(options: WebGpuBufferOptions) {
        super(options);
        this.renderer = options.renderer;

        this.handle = options.renderer.device.createBuffer({
            size: options.size,
            usage: WebGpuBuffer.translateBufferUsage(options.usages)
        });

        if (options.data !== undefined) {
            if (options.data instanceof ArrayBuffer) {
                this.writeBytes(options.data);
            } else {
                this.writeElements(options.data);
            }
        }
    }

    public destroy(): void {
        this.handle.destroy();
    }

    public writeElements(sourceData: BufferElements, bufferIndexOffset: number = 0, sourceIndexOffset: number = 0, sourceSize: number = sourceData.length): void {
        this.renderer.device.queue.writeBuffer(this.handle, bufferIndexOffset * sourceData.BYTES_PER_ELEMENT, sourceData, sourceIndexOffset, sourceSize);
    }

    public writeBytes(sourceData: ArrayBuffer, bufferOffset: number = 0, sourceOffset: number = 0, sourceSize: number = sourceData.byteLength): void {
        this.renderer.device.queue.writeBuffer(this.handle, bufferOffset, sourceData, sourceOffset, sourceSize);
    }

    private static translateSingleBufferUsage(usage: BufferUsage): number {
        switch (usage) {
            case BufferUsage.Storage: return GPUBufferUsage.STORAGE;
            case BufferUsage.Uniform: return GPUBufferUsage.UNIFORM;
            case BufferUsage.Vertex: return GPUBufferUsage.VERTEX;
            case BufferUsage.Index: return GPUBufferUsage.INDEX;
            case BufferUsage.CopyDestination: return GPUBufferUsage.COPY_DST;
            case BufferUsage.CopySource: return GPUBufferUsage.COPY_SRC;
            default: throw new Error(`Unsure how to translate "BufferUsage" ${usage} to WebGPU buffer usage.`);
        }
    }

    public static translateBufferUsage(usages: BufferUsage[]): number {
        return usages.reduce((webGpuUsage, usage) => {
            return webGpuUsage |= this.translateSingleBufferUsage(usage);
        }, 0);
    }

}