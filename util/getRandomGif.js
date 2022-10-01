module.exports = async (gifTags = []) => {
    const giphyRandom = require("giphy-random");
    const config = require("../config.json");

    const randomElement = gifTags[Math.floor(Math.random() * gifTags.length)];
    const { data } = await giphyRandom(config.giphy, {
        tag: randomElement
    });
    let images = data.images;
    if (data.images && data.images.original) {
        return data.images.original.url;
    } else {
        return null;
    };
};