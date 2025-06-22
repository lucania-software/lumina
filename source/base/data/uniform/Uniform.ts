
export class Uniform<Type extends ArrayBufferView = ArrayBufferView> {

    public readonly name: string;
    public readonly value: Type;

    public constructor(name: string, value: Type) {
        this.name = name;
        this.value = value;
    }

}