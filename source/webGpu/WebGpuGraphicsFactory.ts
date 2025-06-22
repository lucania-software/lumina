import { Data } from "@lucania/toolbox/shared";
import { BufferOptions } from "../base/data/buffer/Buffer.js";
import { InstanceManagerOptions } from "../base/data/InstanceManager.js";
import { MaterialOptions } from "../base/data/material/Material.js";
import { TextureOptions } from "../base/data/material/Texture.js";
import { GraphicsFactory } from "../base/GraphicsFactory.js";
import { PipelineOptions } from "../base/process/Pipeline.js";
import { ShaderOptions } from "../base/process/Shader.js";
import { WebGpuBuffer } from "./data/buffer/WebGpuBuffer.js";
import { WebGpuMaterial } from "./data/material/WebGpuMaterial.js";
import { WebGpuTexture } from "./data/material/WebGpuTexture.js";
import { WebGpuInstanceManager } from "./data/WebGpuInstanceManager.js";
import { WebGpuPipeline } from "./process/WebGpuPipeline.js";
import { WebGpuShader } from "./process/WebGpuShader.js";
import type { WebGpuRenderer } from "./WebGpuRenderer.js";

export class WebGpuGraphicsFactory extends GraphicsFactory {

    public readonly renderer: WebGpuRenderer;

    public constructor(renderer: WebGpuRenderer) {
        super();
        this.renderer = renderer;
    }
    public createPipeline(options: PipelineOptions): WebGpuPipeline {
        const shaders = options.shaders;
        Data.assert(
            shaders.every((shader) => shader instanceof WebGpuShader),
            WebGpuGraphicsFactory._createFactoryMismatchMessage(
                `Invalid shaders. Expected all shaders to be instances of ${WebGpuShader.name}.`
            )
        );
        return new WebGpuPipeline({ renderer: this.renderer, ...options, shaders });
    }

    public createBuffer(options: BufferOptions): WebGpuBuffer {
        return new WebGpuBuffer({ renderer: this.renderer, ...options });
    }

    public createMaterial(options: MaterialOptions): WebGpuMaterial {
        const pipeline = options.pipeline;
        Data.assert(
            pipeline instanceof WebGpuPipeline,
            WebGpuGraphicsFactory._createFactoryMismatchMessage(
                `Invalid pipeline. Expected pipeline to be an instance of ${WebGpuPipeline.name}.`
            )
        );
        return new WebGpuMaterial({ ...options, pipeline });
    }

    public createTexture(options: TextureOptions): WebGpuTexture {
        return new WebGpuTexture({ ...options, renderer: this.renderer });
    }

    public createShader(options: ShaderOptions): WebGpuShader {
        return new WebGpuShader({ ...options, renderer: this.renderer });
    }

    public createInstanceManager(options: InstanceManagerOptions): WebGpuInstanceManager {
        const instanceManager = new WebGpuInstanceManager({ ...options, renderer: this.renderer });
        instanceManager.pack();
        return instanceManager;
    }

    private static _createFactoryMismatchMessage(message: string): string {
        return [
            message,
            `This likely indicates that shaders were created by a different renderer or factory.`,
            `Ensure all graphics objects (shaders, materials, etc.) are created using the same ${GraphicsFactory.name} instance.`
        ].join(" ");
    }

}