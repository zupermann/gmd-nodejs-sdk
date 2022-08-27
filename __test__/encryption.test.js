import KeyEncryption from "../dist/key-encryption.js";

const testString = "String was correctly decrypted";
const password = "Password 123 !@#$%^&*()_+{}:|<>?/.,\;][=-"

export const testEncryption = async () => {
    const encryptedJSON = await KeyEncryption.encryptStr(testString, password)
    console.log('EncryptedJSON=' + JSON.stringify(encryptedJSON, null, 2));

    const str = await KeyEncryption.decryptToStr(encryptedJSON, password);
    console.assert(str == testString, "decryption failed");
    console.log(str);
}