export default (objectList) => {
    let listKeys = Object.keys(objectList);
    return objectList[listKeys[listKeys.length * Math.random() << 0]];
};