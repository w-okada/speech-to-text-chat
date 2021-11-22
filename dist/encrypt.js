"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeInformation = exports.encodeInformation = void 0;
const crypto = __importStar(require("crypto"));
const algorithm = "aes-256-cbc";
const password = generateRandomString(16);
const salt = generateRandomString(16);
const key = crypto.scryptSync(password, salt, 32);
const iv = crypto.randomBytes(16);
const secret = generateRandomString(16);
function generateRandomString(length) {
    return crypto.randomBytes(length).reduce((p, i) => p + (i % 36).toString(36), "");
}
const encodeInformation = (info) => {
    const envelop = { data: info, secret: secret };
    const cipher = crypto.createCipheriv(algorithm, key, iv); // 暗号用インスタンス
    const cipheredData = cipher.update(JSON.stringify(envelop), "utf8", "hex") + cipher.final("hex");
    return cipheredData;
};
exports.encodeInformation = encodeInformation;
const decodeInformation = (cipheredData) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv); // 復号用インスタンス
    const decipheredDataJson = decipher.update(cipheredData, "hex", "utf8") + decipher.final("utf8");
    const decipheredData = JSON.parse(decipheredDataJson);
    if (decipheredData.secret === secret) {
        decipheredData.secret = undefined;
        return decipheredData.data;
    }
    else {
        console.log("!!!!!!!!!!! secret is not match !!!!!!!!!!!");
        return null;
    }
};
exports.decodeInformation = decodeInformation;
