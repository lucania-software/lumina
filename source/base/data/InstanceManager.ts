import { Matrix4, Vector4 } from "@lucania/vectorics";
import { Pipeline } from "../process/Pipeline.js";
import { Model } from "./model/Model.js";

export type InstanceData = {
    transform: Matrix4,
    textureBounds: Vector4
};

export interface InstanceManagerOptions {
    model: Model;
    pipeline: Pipeline;
    instances: InstanceData[];
};

export abstract class InstanceManager {

    public readonly pipeline: Pipeline;

    protected _model: Model;
    private _instances: InstanceData[];

    public constructor(options: InstanceManagerOptions) {
        this.pipeline = options.pipeline;
        this._model = options.model;
        this._instances = options.instances;
    }

    public get instances(): readonly InstanceData[] {
        return this._instances;
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

    public abstract pack(): void;

    public abstract render(): void;

}