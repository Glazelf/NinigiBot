import randomNumber from "./randomNumber.js";

export default (objectList) => {
    let listKeys = Object.keys(objectList);
    return objectList[listKeys[randomNumber(0, listKeys.length - 1)]];
};