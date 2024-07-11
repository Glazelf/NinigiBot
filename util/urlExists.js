import XMLHttpRequest from "xmlhttprequest";

export default (url) => {
    const XMLHttpRequestConstructor = XMLHttpRequest.XMLHttpRequest;
    let http = new XMLHttpRequestConstructor();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
};