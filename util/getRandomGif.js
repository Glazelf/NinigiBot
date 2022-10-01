module.exports = async (gifTags = []) => {
    const giphyRandom = require("giphy-random");
    const config = require("../config.json");

    const randomElement = gifTags[Math.floor(Math.random() * gifTags.length)];

    const { data } = await giphyRandom(config.giphy, {
        tag: randomElement
    });
    console.log(data)
    return data.images.original.url;
};