module.exports = (proportion) => {
    if (proportion < 0.25) return '#ffaa8f';
    if (proportion < 0.5) return '#ffd500';
    else return '#41e94f';
};