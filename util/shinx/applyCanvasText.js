module.exports = (canvas, text, baseSize, limit) => {
    const ctx = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = baseSize + 5;

    do {
        // Assign the font to the context and decrement it so it can be measured again
        ctx.font = `normal bolder ${fontSize -= 4}px Arial`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (ctx.measureText(text).width > limit);

    // Return the result to use in the actual canvas
    return ctx.font;
};