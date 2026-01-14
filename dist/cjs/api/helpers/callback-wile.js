"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbackWile = void 0;
const DEFAULT_MAX_SIZE = 10000;
class callbackWile {
    obj;
    maxSize;
    constructor(maxSize = DEFAULT_MAX_SIZE) {
        this.obj = [];
        this.maxSize = maxSize;
    }
    addObjects(ids, serializeds) {
        const existingIndex = this.obj.findIndex((order) => order.serialized === serializeds);
        if (existingIndex !== -1) {
            // Move to end (most recently used)
            const [item] = this.obj.splice(existingIndex, 1);
            item.id = ids;
            this.obj.push(item);
            return false;
        }
        // Evict oldest entries if at capacity
        while (this.obj.length >= this.maxSize) {
            this.obj.shift();
        }
        this.obj.push({
            id: ids,
            serialized: serializeds
        });
        return true;
    }
    getObjKey(serialized) {
        for (let i in this.obj) {
            if (this.obj[i].serialized === serialized) {
                return i;
            }
        }
        return false;
    }
    checkObj(id, serialized) {
        return this.obj.some((order) => order.id === id && order.serialized === serialized);
    }
    get module() {
        return this.obj;
    }
}
exports.callbackWile = callbackWile;
//# sourceMappingURL=callback-wile.js.map