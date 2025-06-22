import { Color } from "@lucania/toolbox/shared";
import { Model } from "./data/model/Model.js";
import { GraphicsFactory } from "./GraphicsFactory.js";
import { Pipeline } from "./process/Pipeline.js";
import { InstanceManager } from "./data/GenericInstanceManager.js";

export interface RendererOptions {
    clearColor?: Color;
    debug?: boolean;
};

export abstract class Renderer {

    private _pipeline?: Pipeline;

    public readonly abstract factory: GraphicsFactory;
    public readonly clearColor: Color;
    public readonly debug: boolean;

    public constructor(options: RendererOptions) {
        this.clearColor = options.clearColor ?? Color.BLACK;
        this.debug = options.debug ?? false;
    }

    public abstract initialize(canvas: HTMLCanvasElement): Promise<void>;

    public abstract begin(): void;

    public abstract renderModel(model: Model): void;

    public abstract renderInstances(instanceManager: InstanceManager): void;

    public abstract end(): void;

    public get pipeline(): Pipeline | undefined {
        return this._pipeline;
    }

    public set pipeline(pipeline: Pipeline | undefined) {
        this._pipeline = pipeline;
    }

}