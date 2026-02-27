export default (components) => {
    let boardTitleString = "This was the full board:\n";
    let matrixString = "";
    components.forEach(actionRow => {
        matrixString += "";
        actionRow.components.forEach(button => {
            let emoji = button.data.custom_id.split("-")[2];
            // if (emoji == bombEmoji) matrixString += "\\"; // Escape emote for readability but seems to break on mobile and just display :bomb:
            matrixString += `${emoji}`;
        });
        matrixString += "\n";
    });
    return `${boardTitleString}${matrixString}`;
};