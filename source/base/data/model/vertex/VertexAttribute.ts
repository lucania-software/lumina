import { Tuple2, Tuple3, Tuple4, Vector } from "@lucania/vectorics";

export type VertexAttributeSize = 2 | 3 | 4;

type TupleMap = {
    2: Tuple2,
    3: Tuple3,
    4: Tuple4
};

export type VertexAttributeScalar = "float32" | "integer32" | "unsigned_integer32";

export interface VertexAttributeDescriptor {
    name: string;
    scalarType: VertexAttributeScalar;
    vectorSize: keyof TupleMap;
};

export class VertexAttribute<Size extends VertexAttributeSize = VertexAttributeSize> extends Vector<TupleMap[Size]> {

    public readonly name: string;

    public constructor(name: string, source: TupleMap[Size]) {
        super(...source);
        this.name = name;
    }

    public adheresTo(descriptor: VertexAttributeDescriptor): boolean {
        return (
            this.name === descriptor.name &&
            this.size === descriptor.vectorSize
        );
    }

}