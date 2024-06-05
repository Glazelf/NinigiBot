import XMLHttpRequest from "xmlhttprequest";

export default (imageURL) => {
    const XMLHttpRequestConstructor = XMLHttpRequest.XMLHttpRequest;
    let http = new XMLHttpRequestConstructor();
    http.open('HEAD', imageURL, false);
    http.send();
    return http.status != 404;
};