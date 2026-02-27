export default (input, enum1) => { // Can't name this "enum" outside of TypeScript files, rename this in #1019
    for (const e of Object.keys(enum1)) {
        if (enum1[e] === input) return e;
    };
    return null;
};