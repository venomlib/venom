export class callbackWile {
    obj;
    constructor() {
        this.obj = [];
    }
    addObjects(ids, serializeds) {
        let checkFilter = this.obj['filter']((order) => order.serialized === serializeds);
        let add = null;
        if (!checkFilter.length) {
            add = {
                id: ids,
                serialized: serializeds
            };
            this.obj['push'](add);
            return true;
        }
        return false;
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
        let checkFilter = this.obj['filter']((order) => order.id === id && order.serialized === serialized);
        return !!checkFilter.length;
    }
    get module() {
        return this.obj;
    }
}
//# sourceMappingURL=callback-wile.js.map