export default () => {
    let currentdate = new Date();
    let datetime = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds() + " UTC"; // Time is not actually UTC but is UTC on production. Therefor this is usefull for logs. Note that timestamps if this is selfhosted, timestamps will be off
    return datetime;
};