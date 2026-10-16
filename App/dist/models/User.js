"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPublicUser = toPublicUser;
function toPublicUser(user) {
    const { passwordHash, ...publicUser } = user;
    return publicUser;
}
//# sourceMappingURL=User.js.map