import { AckType } from '../model/enum/index.js';
export declare class callbackWile {
    obj: Array<{
        id: AckType | string;
        serialized: string;
    }>;
    constructor();
    addObjects(ids: AckType | string, serializeds: string): boolean;
    getObjKey(serialized: string): string | false;
    checkObj(id: AckType | string, serialized: string): boolean;
    get module(): {
        id: AckType | string;
        serialized: string;
    }[];
}
