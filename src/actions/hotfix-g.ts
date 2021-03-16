import inquirer from "inquirer";
import {execSync} from "child_process";
import {Git} from "../utils/git";
import chalk from "chalk";

const startQuestions = [{
    type: 'input',
    name: 'hotfixName',
    message: '请填写灰度的 Hotfix-g 名称，建议使用 BUG 单 ID：',
    filter: (value: String) => value.trim(),
    validate: (value: String): (Boolean | String) => {
        const validate = value.trim().split(' ').length === 1;
        return validate || 'Hotfix 名称不能有空格';
    },
    transformer: (value: String) => `hotfix-g/${value}`
}];

const finishQuestions = [{
    type: 'input',
    name: 'hotfixName',
    message: '此操作将把 Hotfix-g 分支合入 gray 分支，请填写要结束的 Hotfix-g 分支名称：',
    filter: (value: String) => value.trim(),
    validate: (value: String): (Boolean | String) => {
        const validate = value.trim().split(' ').length === 1;
        return validate || 'Hotfix 名称不能有空格';
    },
    transformer: (value: String) => `hotfix-g/${value}`
}];


export async function start(hotfixName: string) {
    if (!hotfixName) {
        let answer: any = await inquirer.prompt(startQuestions);
        hotfixName = answer.hotfixName;
    }

    if (!hotfixName.startsWith('hotfix-g/')) {
        hotfixName = 'hotfix-g/' + hotfixName;
    }

    console.log('即将拉取灰度的 hotfix 分支 ->', chalk.yellowBright(hotfixName));

    try {
        // 1.更新 gray 分支
        Git.checkoutBranch('gray');
        await Git.pullWithRebase();

        // 2. 创建 hotfix-g 分支
        await Git.createBranchFrom(hotfixName, 'gray');
        await Git.checkoutBranch(hotfixName);
        console.log('hotfix-g 分支创建完成，当前所在分支 ->', chalk.yellowBright(hotfixName));
    } catch (e) {
        console.error(chalk.redBright('hotfix-g 分支创建失败'));
    }
}


export async function finish(hotfixName: string) {
    const currentBranchName = await Git.getCurrentBranchName();
    if (!hotfixName) {

        // 先检查当前是否是 hotfix 分支
        if (currentBranchName.startsWith('hotfix-g/')) {
            let {use} = await inquirer.prompt([{
                type: 'input',
                name: 'use',
                message: `是否 finish 当前 hotfix-g 分支: ${currentBranchName} (y/n)：`,
                filter: (value: string) => value.trim(),
            }]);
            console.log('use', use);
            if (use === 'y' || use === 'Y') {
                hotfixName = currentBranchName;
            } else {
                let answer: any = await inquirer.prompt(finishQuestions);
                hotfixName = answer.hotfixName;
            }
        } else {
            let answer: any = await inquirer.prompt(finishQuestions);
            hotfixName = answer.hotfixName;
        }
    }

    if (!hotfixName.startsWith('hotfix-g/')) {
        hotfixName = 'hotfix-g/' + hotfixName;
    }

    try {
        Git.checkoutBranch('gray');
        await Git.pullWithRebase();
        await Git.mergeBranches('gray', hotfixName);
        console.info(chalk.green(`灰度的 hotfix 分支【${hotfixName}】合入 gray 完成`));

        Git.checkoutBranch('rc');
        await Git.pullWithRebase();
        await Git.mergeBranches('rc', 'gray');
        console.info(chalk.green(`灰度的 hotfix 分支【${hotfixName}】合入 rc 完成`));

        Git.checkoutBranch('develop');
        await Git.pullWithRebase();
        await Git.mergeBranches('develop', 'rc');
        console.info(chalk.green(`灰度的 hotfix 分支【${hotfixName}】合入 develop 完成`));

        console.info(chalk.green(`灰度环境的 hotfix 分支【${hotfixName}】合入 gray 完成，请手动 push [gray/rc/develop] 的代码`));

        const {confirm} = await inquirer.prompt([{
            type: 'input',
            name: 'confirm',
            message: `是否需要删除 hotfix-g 分支【${hotfixName}】？(y/n)`,
        }]);

        if (confirm === 'y' || confirm === 'Y') {
            try {
                await Git.deleteBranch(hotfixName);
            } catch (e) {
                console.error(chalk.redBright(`hotfix-g【${hotfixName}】删除失败：${e}`));
            }
        }

    } catch (e) {
        console.error('hotfix-g finish 失败', e);
    }

}
