import { Data } from "@lucania/toolbox/shared";
import { VertexAttributeContract } from "../../../process/Pipeline.js";
import { VertexAttribute, VertexAttributeScalar } from "./VertexAttribute.js";

export class Vertex {

    private readonly _attributes: Map<string, VertexAttribute>;

    public constructor(attributes: VertexAttribute[]) {
        this._attributes = attributes.reduce((map, attribute) => map.set(attribute.name, attribute), new Map());
    }

    public getAttribute(name: string): VertexAttribute {
        const attribute = this._attributes.get(name);
        Data.assert(attribute !== undefined, `Vertex does not have an attribute named "${name}".`);
        return attribute;
    }

    public adheresTo(contract: VertexAttributeContract): boolean {
        for (const descriptor of contract.values()) {
            const attribute = this._attributes.get(descriptor.name);
            if (attribute === undefined || !attribute.adheresTo(descriptor)) {
                return false;
            }
        }
        return true;
    }

    public static flatten(vertices: readonly Vertex[], contract: VertexAttributeContract): ArrayBuffer {
        const buffer = new ArrayBuffer(vertices.length * Vertex.getStride(contract));
        const view = new DataView(buffer);
        let offset = 0;
        for (const vertex of vertices) {
            for (const attributeDescriptor of contract) {
                const attribute = vertex.getAttribute(attributeDescriptor.name);
                switch (attributeDescriptor.scalarType) {
                    case "float32":
                        attribute.components.forEach((value, index) => (
                            view.setFloat32(offset + index * Vertex.getScalarByteLength(attributeDescriptor.scalarType), value, true)
                        ));
                        break;
                    case "integer32":
                        attribute.components.forEach((value, index) => (
                            view.setInt32(offset + index * Vertex.getScalarByteLength(attributeDescriptor.scalarType), value, true)
                        ));
                        break;
                    case "unsigned_integer32":
                        attribute.components.forEach((value, index) => (
                            view.setUint32(offset + index * Vertex.getScalarByteLength(attributeDescriptor.scalarType), value, true)
                        ));
                        break;
                    default:
                        throw new Error(`Invalid scalar type "${attributeDescriptor.scalarType}" on attribute "${attributeDescriptor.name}".`);
                }
                offset += attributeDescriptor.vectorSize * Vertex.getScalarByteLength(attributeDescriptor.scalarType);
            }
        }
        return buffer;
    }

    public static getStride(contract: VertexAttributeContract): number {
        return contract.reduce((stride, attributeDescriptor) => (
            stride + attributeDescriptor.vectorSize * Vertex.getScalarByteLength(attributeDescriptor.scalarType)
        ), 0);
    }

    public static getScalarByteLength(scalarType: VertexAttributeScalar): number {
        switch (scalarType) {
            case "float32":
            case "integer32":
            case "unsigned_integer32":
                return 4;
            default:
                throw new Error(`Invalid scalar type "${scalarType}".`);
        }
    }

}