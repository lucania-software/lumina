import { Buffer, BufferOptions } from "./data/buffer/Buffer.js";
import { InstanceManager, InstanceManagerOptions } from "./data/InstanceManager.js";
import { Material, MaterialOptions } from "./data/material/Material.js";
import { Texture, TextureOptions } from "./data/material/Texture.js";
import { Pipeline, PipelineOptions } from "./process/Pipeline.js";
import { Shader, ShaderOptions } from "./process/Shader.js";

export abstract class GraphicsFactory {

    public abstract createPipeline(options: PipelineOptions): Pipeline;

    public abstract createBuffer(options: BufferOptions): Buffer;

    public abstract createMaterial(options: MaterialOptions): Material;

    public abstract createTexture(options: TextureOptions): Texture;

    public abstract createShader(options: ShaderOptions): Shader;

    public abstract createInstanceManager(options: InstanceManagerOptions): InstanceManager;

}