import randomNumber from "./randomNumber.js";

export default (objectList: any) => {
    let listKeys = Object.keys(objectList);
    switch (listKeys.length) {
        case 0:
            return null;
        case 1:
            return objectList[listKeys[0]];
        default:
            return objectList[listKeys[randomNumber(0, listKeys.length - 1)]];
    };
};