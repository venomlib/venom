"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeScreen = welcomeScreen;
const yoo_hoo_1 = require("yoo-hoo");
let welcomeShown = false;
function welcomeScreen() {
    if (welcomeShown) {
        return;
    }
    welcomeShown = true;
    (0, yoo_hoo_1.yo)('VENOM-BOT', { color: 'cyan' });
    console.log('\n\n');
}
//# sourceMappingURL=welcome.js.map