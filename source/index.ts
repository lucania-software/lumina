import { WebGpuRenderer } from "webGpu/WebGpuRenderer.js";

export * from "./base/data/GenericInstanceManager.js";
export * from "./base/data/material/Material.js";
export * from "./base/data/material/Texture.js";
export * from "./base/data/model/mesh/Mesh.js";
export * from "./base/data/model/Model.js";
export * from "./base/data/model/vertex/Vertex.js";
export * from "./base/data/model/vertex/VertexAttribute.js";
export * from "./base/data/uniform/Uniform.js";
export * from "./base/GraphicsFactory.js";
export * from "./base/process/Pipeline.js";
export * from "./base/process/Shader.js";
export * from "./base/Renderer.js";
export * from "./shaders/shaders.js";

import type { RendererOptions } from "./base/Renderer.js";

export function createRenderer(window: Window, options: RendererOptions) {
    return new WebGpuRenderer({ ...options, gpu: window.navigator.gpu });
}