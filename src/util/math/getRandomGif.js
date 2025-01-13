import axios from "axios";

const giphyAPI = "https://api.giphy.com/v1/gifs/random";

export default async (gifTags = []) => {
    const randomTag = gifTags[Math.floor(Math.random() * gifTags.length)];
    let giphyParams = {
        api_key: process.env.GIPHY_TOKEN,
        rating: "g"
    };
    if (gifTags.length > 0) giphyParams.tag = randomTag;
    // Uglier replacement function for the one below
    let giphyURL = `${giphyAPI}?`;
    Object.entries(giphyParams).forEach(([key, value]) => {
        giphyURL += `${key}=${value}&`;
    });
    let giphyResponse = await axios.get(giphyURL).catch(e => {
        console.log(e);
        return null;
    });
    //// Ideally would use this, but for some reason this method returns a 401 error. The above works the same, but is slower and uglier
    // let giphyResponse = await axios.get(giphyAPI, {
    //     giphyParams
    // }).catch(e => {
    //     console.log(e);
    //     return null;
    // });

    let data = null;
    // if (giphyResponse) data = giphyResponse.data; // Information depth with original function
    if (giphyResponse) data = giphyResponse.data.data; // Information depth with replacement function
    if (!data) return null;
    if (data.images && data.images.original) {
        return data.images.original.url;
    } else {
        return null;
    };
};