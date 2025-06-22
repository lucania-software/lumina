export interface TextureOptions {
    source: ImageBitmap | { width: number, height: number };
};

export abstract class Texture {

    public readonly width: number;
    public readonly height: number;

    public constructor(options: TextureOptions) {
        this.width = options.source.width;
        this.height = options.source.height;
    }

}