// Replace synonymous spelling to allow for intended correctness
// Most cases where this is needed are already caught by the dependency
export default (name) => {
    if (typeof name == "string") {
        name = name.replace(/gigantamax/i, "gmax");
    };
    return name;
};