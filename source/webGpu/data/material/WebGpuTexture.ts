import { WebGpuRenderer } from "../../WebGpuRenderer.js";
import { Texture, TextureOptions } from "../../../base/data/material/Texture.js";

export interface WebGpuTextureOptions extends TextureOptions {
    renderer: WebGpuRenderer;
};

export class WebGpuTexture extends Texture {

    public readonly handle: GPUTexture;

    public constructor(options: WebGpuTextureOptions) {
        super(options);
        this.handle = options.renderer.device.createTexture({
            label: "Pristine Texture",
            format: "rgba8unorm",
            size: { width: this.width, height: this.height },
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST
        });
        if (options.source instanceof ImageBitmap) {
            options.renderer.device.queue.copyExternalImageToTexture(
                { source: options.source, flipY: true },
                { texture: this.handle },
                { width: this.width, height: this.height }
            );
        }
    }

}