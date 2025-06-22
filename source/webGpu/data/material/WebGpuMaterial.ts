import { Data } from "@lucania/toolbox/shared";
import { Material, MaterialOptions } from "../../../base/data/material/Material.js";
import { WebGpuPipeline } from "../../process/WebGpuPipeline.js";
import { WebGpuTexture } from "./WebGpuTexture.js";
import { BindGroupIndex } from "../../WebGpuBindGroupIndex.js";

export interface WebGpuMaterialOptions extends MaterialOptions {
    pipeline: WebGpuPipeline;
}

export class WebGpuMaterial extends Material {

    public readonly bindGroup: GPUBindGroup;

    public constructor(options: WebGpuMaterialOptions) {
        super(options);
        const renderer = options.pipeline.renderer;

        const entries: GPUBindGroupEntry[] = [
            {
                binding: 0,
                resource: renderer.device.createSampler({
                    label: "Pristine Material Texture Sampler",
                    minFilter: "nearest",
                    magFilter: "nearest",
                    addressModeU: "clamp-to-edge",
                    addressModeV: "clamp-to-edge",
                    addressModeW: "clamp-to-edge"
                })
            }
        ];

        if (options.textures !== undefined) {
            entries.push(...options.textures.map((texture, index) => {
                Data.assert(texture instanceof WebGpuTexture);
                return {
                    binding: 1 + index,
                    resource: texture.handle.createView()
                };
            }));
        }

        if (options.uniforms !== undefined) {
            throw new Error(`The "${WebGpuMaterial.name}" class does not current have uniform support.`);
        }

        this.bindGroup = renderer.device.createBindGroup({
            label: "Pristine Material Bind Group",
            layout: options.pipeline.handle.getBindGroupLayout(BindGroupIndex.Material),
            entries
        });
    }

}