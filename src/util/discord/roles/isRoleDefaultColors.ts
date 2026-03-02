const defaultColors = { primaryColor: 0, secondaryColor: null, tertiaryColor: null };

export default (input) => {
    return (JSON.stringify(input) == JSON.stringify(defaultColors));
};