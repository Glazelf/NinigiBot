module.exports = async (gifTags = []) => {
    const axios = require("axios");
    const config = require("../config.json");
    const randomTag = gifTags[Math.floor(Math.random() * gifTags.length)];
    let giphyParams = {
        api_key: config.giphy,
        rating: "g"
    };
    if (gifTags.length > 0) giphyParams.tag = randomTag;
    const giphyResponse = await axios.get("https://api.giphy.com/v1/gifs/random", {
        giphyParams
    }).catch(e => {
        console.log(e);
        return null;
    });
    let data = null;
    if (giphyResponse) data = giphyResponse.data;
    if (!data) return null;
    let images = data.images;
    if (data.images && data.images.original) {
        return data.images.original.url;
    } else {
        return null;
    };
};