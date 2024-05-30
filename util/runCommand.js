export default (command) => {
    const util = require('node:util');
    const exec = util.promisify(require('node:child_process').exec);
    return lsExample(command);

    async function lsExample(command) {
        const { stdout, stderr } = await exec(command);
        console.log('stdout:', stdout);
        console.error('stderr:', stderr);
        return { stdout, stderr };
    };
};