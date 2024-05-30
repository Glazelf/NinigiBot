export default (imageURL) => {
    const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    let http = new XMLHttpRequest();
    http.open('HEAD', imageURL, false);
    http.send();
    return http.status != 404;
};