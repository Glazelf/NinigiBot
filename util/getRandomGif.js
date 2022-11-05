module.exports = async (gifTags = []) => {
    const axios = require("axios");
    const config = require("../config.json");
    const randomElement = gifTags[Math.floor(Math.random() * gifTags.length)];
    let giphyParams = {
        api_key: config.giphy,
        rating: "g"
    };
    if (gifTags.length > 0) giphyParams.tag = gifTags;
    const { data } = await axios.get("https://api.giphy.com/v1/gifs/random", {
        giphyParams
    }).catch(e => {
        console.log(e);
        return null;
    });
    let images = data.images;
    if (data.images && data.images.original) {
        return data.images.original.url;
    } else {
        return null;
    };
};