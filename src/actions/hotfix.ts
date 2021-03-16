import inquirer from "inquirer";
import {Git} from "../utils/git";
import chalk from "chalk";
import * as HotfixG from './hotfix-g';

const startQuestions = [{
    type: 'input',
    name: 'hotfixName',
    message: '请填写正式环境的 Hotfix 名称，建议使用 BUG 单 ID：',
    filter: (value: String) => value.trim(),
    validate: (value: String): (Boolean | String) => {
        const validate = value.trim().split(' ').length === 1;
        return validate || 'Hotfix 名称不能有空格';
    },
    transformer: (value: String) => `hotfix/${value}`
}];

const finishQuestions = [{
    type: 'input',
    name: 'hotfixName',
    message: '此操作将把 Hotfix 分支合入 master 分支，请填写要结束的 Hotfix 分支名称：',
    filter: (value: String) => value.trim(),
    validate: (value: String): (Boolean | String) => {
        const validate = value.trim().split(' ').length === 1;
        return validate || 'Hotfix 名称不能有空格';
    },
    transformer: (value: String) => `hotfix/${value}`
}];


export async function start(hotfixName: string) {
    if (!hotfixName) {
        let answer: any = await inquirer.prompt(startQuestions);
        hotfixName = answer.hotfixName;
    }

    if (!hotfixName.startsWith('hotfix/')) {
        hotfixName = 'hotfix/' + hotfixName;
    }

    console.log('即将拉取正式环境的 hotfix 分支 ->', chalk.yellowBright(hotfixName));

    try {
        // 1.更新 master 分支
        await Git.checkoutBranch('master');
        await Git.pullWithRebase();

        // 2. 创建 hotfix 分支
        await Git.createBranchFrom(hotfixName, 'master');
        await Git.checkoutBranch(hotfixName);

        console.log('hotfix 分支创建完成，当前所在分支 ->', chalk.yellowBright(hotfixName));
    } catch (e) {
        console.error(chalk.redBright('hotfix 分支创建失败'));
    }
}


export async function finish(hotfixName: string) {
    const currentBranchName = await Git.getCurrentBranchName();

    if (!hotfixName) {

        // 先检查当前是否是 hotfix 分支
        if (currentBranchName.startsWith('hotfix/')) {
            let {use} = await inquirer.prompt([{
                type: 'input',
                name: 'use',
                message: `是否 finish 当前 hotfix 分支: ${currentBranchName} (y/n)：`,
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

    if (!hotfixName.startsWith('hotfix/')) {
        hotfixName = 'hotfix/' + hotfixName;
    }

    try {
        // 1. 更新 master 分支
        await Git.checkoutBranch('master');
        await Git.pullWithRebase();

        // 2. 合入 master 分支
        await Git.mergeBranches('master', hotfixName);
        console.info(chalk.green(`正式环境的 hotfix 分支【${hotfixName}】合入 master 完成`));

        // 3. 从 gray 拉 hotfix
        const hotfixGForMerge = `hotfix-g/${hotfixName}`;
        await HotfixG.start(hotfixGForMerge);

        try {
            // 4. 将 master 合入 hotfix-g
            await Git.mergeBranches(hotfixGForMerge, 'master');

            await HotfixG.finish(hotfixGForMerge);

            console.info(chalk.green(`正式环境的 hotfix 分支【${hotfixName}】合入 gray 完成，请手动 push [master/gray/rc/develop] 的代码`));

            const {confirm} = await inquirer.prompt([{
                type: 'input',
                name: 'confirm',
                message: `是否需要删除 hotfix 分支【${hotfixName}】？(y/n)`,
            }]);

            if (confirm === 'y' || confirm === 'Y') {
                try {
                    await Git.deleteBranch(hotfixName);
                } catch (e) {
                    console.error(chalk.redBright(`hotfix【${hotfixName}】删除失败：${e}`));
                }
            }

        } catch (e) {
            // 如果出现冲突，需要解决
            console.error(chalk.green(`正式环境的 hotfix 分支【${hotfixName}】合入 gray 失败: ${e}`));
        }

    } catch (e) {
        console.error('hotfix finish 失败', e);
    }

}
