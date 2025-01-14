import util from "node:util";
import child_process from "node:child_process";

export default (command: any) => {
    const exec = util.promisify(child_process.exec);
    return lsExample(command);

    async function lsExample(command: any) {
        const { stdout, stderr } = await exec(command);
        console.log('stdout:', stdout);
        console.error('stderr:', stderr);
        return { stdout, stderr };
    };
};