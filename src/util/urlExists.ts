// @ts-expect-error TS(7016): Could not find a declaration file for module 'xmlh... Remove this comment to see the full error message
import XMLHttpRequest from "xmlhttprequest";

export default (url: any) => {
    const XMLHttpRequestConstructor = XMLHttpRequest.XMLHttpRequest;
    let http = new XMLHttpRequestConstructor();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
};