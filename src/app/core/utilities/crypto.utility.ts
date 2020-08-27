import { Injectable } from '@angular/core';
import * as crypto from 'crypto-js';
import { CipherKey } from 'src/app/shared/models/breakpoint-models';

@Injectable(
    { providedIn: 'root' }
)
export class CryptoUtility {

    constructor() { }

    /**
     * @function EncryptObject
     * @param plainObject T
     * @returns encryptedText string
     */
    public EncryptObject<T>(plainObject: T): string {
        let encryptedText: string;
        try {
            encryptedText = crypto.AES.encrypt(JSON.stringify(plainObject), CipherKey);
        } catch (error) {
            encryptedText = '';
        }
        return encryptedText;
    }

    /**
     * @function DecryptObject
     * @param ciphertext string
     * @returns decryptedData T
     */
    public DecryptObject<T>(ciphertext: string): T {
        let decryptedData;
        try {
            const bytes = crypto.AES.decrypt(ciphertext.toString(), CipherKey);
            decryptedData = JSON.parse(bytes.toString(crypto.enc.Utf8));
        } catch (error) {
            decryptedData = '';
        }
        return decryptedData;
    }
}