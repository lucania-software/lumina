import { Matrix4 } from "@lucania/vectorics";
import { VertexAttributeContract } from "base/process/Pipeline.js";
import { Renderer } from "base/Renderer.js";
import { Buffer } from "../buffer/Buffer.js";
import { BufferUsage } from "../buffer/BufferUsage.js";
import { Material } from "../material/Material.js";
import { Mesh } from "./mesh/Mesh.js";
import { Vertex } from "./vertex/Vertex.js";

export interface ModelOptions {
    renderer: Renderer;
    mesh: Mesh;
    material: Material;
    contract: VertexAttributeContract;
    transform?: Matrix4;
};

export class Model {

    public readonly mesh: Mesh;
    public readonly material: Material;
    public readonly transform: Matrix4;

    public readonly vertexBuffer: Buffer;
    public readonly indexBuffer: Buffer | undefined;

    public constructor(options: ModelOptions) {
        this.mesh = options.mesh;
        this.material = options.material;
        this.transform = options.transform ?? Matrix4.identity();

        const vertexData = Vertex.flatten(this.mesh.vertices, options.contract);
        this.vertexBuffer = options.renderer.factory.createBuffer({
            size: vertexData.byteLength,
            usages: [BufferUsage.Vertex, BufferUsage.CopyDestination],
            data: vertexData
        });

        if (options.mesh.indices !== undefined) {
            const indexData = new Uint16Array(options.mesh.indices);
            this.indexBuffer = options.renderer.factory.createBuffer({
                size: indexData.byteLength,
                usages: [BufferUsage.Index, BufferUsage.CopyDestination],
                data: indexData
            });
        }
    }

    public set x(x: number) {
        this.transform.data[3] = x;
    }

    public set y(y: number) {
        this.transform.data[7] = y;
    }

    public set z(z: number) {
        this.transform.data[11] = z;
    }

    public set scaleX(scale: number) {
        this.transform.data[0] = scale;
    }

    public set scaleY(scale: number) {
        this.transform.data[5] = scale;
    }

    public set scaleZ(scale: number) {
        this.transform.data[10] = scale;
    }

    public set scale(scale: number) {
        this.scaleX = this.scaleY = this.scaleZ = scale;
    }

}