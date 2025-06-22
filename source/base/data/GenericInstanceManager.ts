import { Data } from "@lucania/toolbox/shared";
import { Matrix4, Vector4 } from "@lucania/vectorics";
import { Renderer } from "../../base/Renderer.js";
import { Pipeline } from "../process/Pipeline.js";
import { Buffer } from "./buffer/Buffer.js";
import { BufferUsage } from "./buffer/BufferUsage.js";
import { Model } from "./model/Model.js";

export type InstanceData = {
    transform: Matrix4,
    textureBounds: Vector4
};

export interface InstanceManagerOptions {
    renderer: Renderer,
    pipeline: Pipeline;
    model: Model;
    instances: InstanceData[];
    /**
     * The number of instances to preallocate in the GPU buffer.
     * Allowing for more space than `instances.length` to be allocated on initialization.
     */
    preallocatedInstanceCount?: number
};

export class InstanceManager {

    /**
     * Ensure this matches {@link InstanceData}.
     */
    public static readonly INSTANCE_SIZE = (
        Matrix4.SIZE +
        Vector4.SIZE
    );

    public readonly renderer: Renderer;
    public readonly pipeline: Pipeline;

    public readonly model: Model;
    private _instances: InstanceData[];
    protected _data: Float32Array;
    protected _buffer: Buffer;

    public constructor(options: InstanceManagerOptions) {
        this.renderer = options.renderer;
        this.pipeline = options.pipeline;
        this.model = options.model;
        this._instances = options.instances;
        this._data = new Float32Array();
        const allocateInstanceCount = options.preallocatedInstanceCount !== undefined && options.preallocatedInstanceCount > this._instances.length ? (
            options.preallocatedInstanceCount
        ) : (
            this._instances.length
        );
        this._buffer = this._createSpecializedBuffer(allocateInstanceCount * InstanceManager.INSTANCE_SIZE);
        this.pack();
    }

    public get instances(): readonly InstanceData[] {
        return this._instances;
    }


    public get buffer(): Buffer {
        return this._buffer;
    }


    public set instances(instances: InstanceData[]) {
        this._instances = instances;
        this.pack();
    }

    public add(instance: InstanceData): void {
        this._instances.push(instance);
        this.pack();
    }

    public remove(instanceOrIndex: InstanceData | number): void {
        if (typeof instanceOrIndex !== "number") {
            const instanceIndex = this._instances.indexOf(instanceOrIndex);
            return this.remove(instanceIndex);
        }
        this._instances.splice(instanceOrIndex, 1);
        this.pack();
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

        if (this._buffer.size < this._data.byteLength) {
            this._buffer.destroy();
            this._buffer = this._createSpecializedBuffer(Math.max(this._buffer.size * 2, this._data.byteLength));
        }
        this._buffer.writeElements(this._data);
    }

    private _createSpecializedBuffer(size: number) {
        return this.renderer.factory.createBuffer({ size, usages: [BufferUsage.Storage, BufferUsage.CopyDestination] });
    }

}