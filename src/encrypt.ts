import * as crypto from "crypto";

export type Envelop<T> = {
    data: T;
    secret?: string;
};

const algorithm = "aes-256-cbc";
const password = generateRandomString(16);
const salt = generateRandomString(16);
const key = crypto.scryptSync(password, salt, 32);
const iv = crypto.randomBytes(16);

const secret = generateRandomString(16);

function generateRandomString(length) {
    return crypto.randomBytes(length).reduce((p, i) => p + (i % 36).toString(36), "");
}

export const encodeInformation = <T>(info: T): string => {
    const envelop: Envelop<T> = { data: info, secret: secret };
    const cipher = crypto.createCipheriv(algorithm, key, iv); // 暗号用インスタンス
    const cipheredData = cipher.update(JSON.stringify(envelop), "utf8", "hex") + cipher.final("hex");
    return cipheredData;
};

export const decodeInformation = <T>(cipheredData: string): T => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv); // 復号用インスタンス
    const decipheredDataJson = decipher.update(cipheredData, "hex", "utf8") + decipher.final("utf8");
    const decipheredData: Envelop<T> = JSON.parse(decipheredDataJson);
    if (decipheredData.secret === secret) {
        decipheredData.secret = undefined;
        return decipheredData.data;
    } else {
        console.log("!!!!!!!!!!! secret is not match !!!!!!!!!!!");
        return null;
    }
};
