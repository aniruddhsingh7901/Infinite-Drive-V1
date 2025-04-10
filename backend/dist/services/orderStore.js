"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderStore = void 0;
class OrderStore {
    constructor() {
        this.currentOrderId = null;
    }
    setCurrentOrderId(orderId) {
        this.currentOrderId = orderId;
    }
    getCurrentOrderId() {
        return this.currentOrderId;
    }
}
exports.orderStore = new OrderStore();
//# sourceMappingURL=orderStore.js.map