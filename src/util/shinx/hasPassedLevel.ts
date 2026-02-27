export default (from: any, to: any, middle: any) => {
    return (from < middle) && (middle <= to);
};