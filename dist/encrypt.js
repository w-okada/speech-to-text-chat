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
exports.Encrypter = void 0;
const crypto = __importStar(require("crypto"));
class Encrypter {
    constructor(params) {
        this.algorithm = "aes-256-cbc";
        this.generateRandomString = (length) => {
            return crypto.randomBytes(length).reduce((p, i) => p + (i % 36).toString(36), "");
        };
        this.encodeInformation = (info) => {
            const envelop = { data: info, secret: this.secret };
            const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv); // 暗号用インスタンス
            const cipheredData = cipher.update(JSON.stringify(envelop), "utf8", "hex") + cipher.final("hex");
            return cipheredData;
        };
        this.decodeInformation = (cipheredData) => {
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv); // 復号用インスタンス
            const decipheredDataJson = decipher.update(cipheredData, "hex", "utf8") + decipher.final("utf8");
            const decipheredData = JSON.parse(decipheredDataJson);
            if (decipheredData.secret === this.secret) {
                decipheredData.secret = undefined;
                return decipheredData.data;
            }
            else {
                console.log("!!!!!!!!!!! secret is not match !!!!!!!!!!!");
                return null;
            }
        };
        this.password = params.password || this.generateRandomString(16);
        this.salt = params.salt || this.generateRandomString(16);
        this.secret = params.secret || this.generateRandomString(16);
        this.key = crypto.scryptSync(this.password, this.salt, 32);
        // this.iv = params.iv || crypto.randomBytes(16);
        this.iv = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    }
}
exports.Encrypter = Encrypter;
