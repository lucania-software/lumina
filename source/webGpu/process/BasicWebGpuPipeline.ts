import { WebGpuRenderer } from "../WebGpuRenderer.js";
import { WebGpuPipeline } from "./WebGpuPipeline.js";
import { WebGpuShader } from "./WebGpuShader.js";
import source from "../shaders/basic.wgsl";

export function createBasicWebGpuPipeline(renderer: WebGpuRenderer): WebGpuPipeline {
    return new WebGpuPipeline({
        renderer,
        shaders: [
            new WebGpuShader({ type: "vertex", renderer, entryPointFunctionName: "vertex_main", source }),
            new WebGpuShader({ type: "fragment", renderer, entryPointFunctionName: "fragment_main", source })
        ],
        contract: [
            { name: "position", scalarType: "float32", vectorSize: 3 },
            { name: "normal", scalarType: "float32", vectorSize: 3 },
            { name: "uv", scalarType: "float32", vectorSize: 2 },
            { name: "color", scalarType: "float32", vectorSize: 4 }
        ]
    });
}