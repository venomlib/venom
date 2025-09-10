import { AckType } from '../model/enum/index.js';
export class callbackWile {
  obj: Array<{ id: AckType | string; serialized: string }>;
  constructor() {
    this.obj = [];
  }
  addObjects(ids: AckType | string, serializeds: string) {
    let checkFilter = this.obj['filter'](
      (order: any) => order.serialized === serializeds
    );
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

  getObjKey(serialized: string) {
    for (let i in this.obj) {
      if (this.obj[i].serialized === serialized) {
        return i;
      }
    }
    return false;
  }

  checkObj(id: AckType | string, serialized: string) {
    let checkFilter = this.obj['filter'](
      (order: any) => order.id === id && order.serialized === serialized
    );
    return !!checkFilter.length;
  }

  get module() {
    return this.obj;
  }
}
