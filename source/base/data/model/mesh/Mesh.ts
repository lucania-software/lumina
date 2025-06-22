import { VertexAttributeContract } from "../../../process/Pipeline.js";
import { Vertex } from "../vertex/Vertex.js";

export interface MeshOptions {
    vertices: Vertex[];
    indices?: number[];
};

export class Mesh {

    public readonly vertices: readonly Vertex[];
    public readonly indices: readonly number[] | undefined;

    public constructor(options: MeshOptions) {
        this.vertices = Object.freeze(options.vertices);
        this.indices = options.indices === undefined ? undefined : Object.freeze(options.indices);
    }

    public adheresTo(contract: VertexAttributeContract): boolean {
        return this.vertices.every((vertex) => vertex.adheresTo(contract));
    }

}