export default (generation) => {
    return `${isNaN(generation) ? `${generation[0].toUpperCase()}${generation.slice(1)}` : `generation ${generation}`}`;
};