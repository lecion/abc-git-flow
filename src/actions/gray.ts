import inquirer from "inquirer";
import {execSync} from "child_process";
import {Git} from "../utils/git";
import chalk from "chalk";

const startQuestions = [{
    type: 'input',
    name: 'confirm',
    message: '此操作将会把 gray 合入 master 分支，是否确认？(y/n)',
}];

export async function publish() {
    let {confirm} = await inquirer.prompt(startQuestions);
    if (confirm === 'y' || confirm === 'Y') {
        try {
            // 1. checkout develop 并更新
            Git.checkoutBranch('gray');
            Git.pullWithRebase();

            // 2. checkout rc 并更新
            Git.checkoutBranch('master');
            Git.pullWithRebase();

            // 3. merge
            await Git.mergeBranches('master', 'gray');

            console.info(chalk.greenBright('合并 gray 到 master 分支成功，请手动 push 代码'));
        } catch (e) {
            console.error(chalk.redBright('合并 gray 到 master 分支失败'));
        }
    }
}
