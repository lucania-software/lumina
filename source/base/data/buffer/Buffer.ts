import { Data } from "@lucania/toolbox/shared";
import { BufferUsage } from "./BufferUsage.js";

export type BufferElements = Float32Array | Int32Array | Uint32Array | Int16Array | Uint16Array | Int8Array | Uint8Array | Uint8ClampedArray | BigInt64Array | BigUint64Array;

export interface BufferOptions {
    usages: BufferUsage[],
    /** The size of the buffer, in bytes. */
    size: number,
    /** Data to write into the buffer. */
    data?: ArrayBuffer | BufferElements
};

export abstract class Buffer {

    public readonly usages: BufferUsage[];
    public readonly size: number;

    public constructor(options: BufferOptions) {
        this.usages = options.usages;
        this.size = options.size;
        if (options.data !== undefined) {
            Data.assert(this.size === options.data.byteLength, [
                `Attempted to create a buffer of size ${this.size},`,
                `but provided ${options.data.byteLength} bytes of data!`
            ].join(" "));
        }
    }

    public abstract destroy(): void;

    /**
     * Writes elements into this buffer.
     * 
     * @param sourceData The source data to write from.
     * @param bufferIndexOffset The index into this buffer to start writing data into.
     * @param sourceIndexOffset The index into `sourceData` to start writing data from.
     * @param sourceSize The number of elements from `sourceData` to write into this buffer.
     */
    public abstract writeElements(sourceData: BufferElements, bufferIndexOffset?: number, sourceIndexOffset?: number, sourceSize?: number): void;

    /**
     * Writes bytes into this buffer.
     * 
     * @param sourceData The source data to write from.
     * @param bufferOffset The byte offset into this buffer to start writing data into.
     * @param sourceOffset The byte offset into `sourceData` to start writing data from.
     * @param sourceSize The number of bytes from `sourceData` to write into this buffer.
     */
    public abstract writeBytes(sourceData: ArrayBuffer, bufferOffset?: number, sourceOffset?: number, sourceSize?: number): void;

}