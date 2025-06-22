export type ShaderType = "vertex" | "fragment" | "compute";

export interface ShaderOptions {
    type: ShaderType;
    entryPointFunctionName: string;
    source: string;
};

export abstract class Shader {

    public readonly type: ShaderType;
    public readonly entryPointFunctionName: string;
    public readonly source: string;

    public constructor(options: ShaderOptions) {
        this.type = options.type;
        this.entryPointFunctionName = options.entryPointFunctionName;
        this.source = options.source;
    }

}