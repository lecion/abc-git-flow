import inquirer from "inquirer";
import {execSync} from "child_process";
import {Git} from "../utils/git";
import chalk from "chalk";

const startQuestions = [{
    type: 'input',
    name: 'confirm',
    message: '此操作将会把 develop 合入 rc 分支，是否确认？(y/n)',
}];

const finishQuestions = [{
    type: 'input',
    name: 'confirm',
    message: '此操作将会把 rc 合入 gray/develop 分支，是否确认？(y/n)',
}];


export async function start() {
    let {confirm} = await inquirer.prompt(startQuestions);
    if (confirm === 'y' || confirm === 'Y') {
        try {
            // 1. checkout develop 并更新
            Git.checkoutBranch('develop');
            Git.pullWithRebase();

            // 2. checkout rc 并更新
            Git.checkoutBranch('rc');
            Git.pullWithRebase();

            // 3. merge
            await Git.mergeBranches('rc', 'develop');

            console.info(chalk.greenBright('合并 develop 到 rc 分支成功，请手动 push 代码'));
        } catch (e) {
            console.error(chalk.redBright('合并 develop 到 rc 分支失败'));
        }
    }
}


export async function finish() {
    let {confirm} = await inquirer.prompt(finishQuestions);
    if (confirm === 'y' || confirm === 'Y') {
        try {
            // 1. checkout rc 并更新
            Git.checkoutBranch('rc');
            Git.pullWithRebase();

            // 2. checkout gray 并更新
            Git.checkoutBranch('gray');
            Git.pullWithRebase();

            // 3. merge
            await Git.mergeBranches('gray', 'rc');

            // 4. 将 rc 合回 develop
            await Git.mergeBranches('develop', 'rc', true);

            console.info(chalk.greenBright('合并 rc 到 gray/develop 分支成功，请手动 push 代码'));
        } catch (e) {
            console.error(chalk.redBright('合并 rc 到 gray/develop 分支失败'));
        }
    }
}
