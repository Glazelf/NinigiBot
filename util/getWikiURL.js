module.exports = (fileName, baseURL) => {
    const crypto = require('crypto');
    let md5 = crypto.createHash("md5").update(fileName).digest("hex");
    let md5first = md5.substring(0, 1);
    let md5duo = md5.substring(0, 2);
    if (baseURL.slice(-1) != '/') baseURL += '/';
    let url = `${baseURL}${md5first}/${md5duo}/${encodeURIComponent(fileName)}`;
    return url;
};