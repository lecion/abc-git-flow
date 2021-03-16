import inquirer from "inquirer";
import {execSync} from "child_process";
import {Git} from "../utils/git";
import chalk from "chalk";

const startFeatureQuestions = [{
    type: 'input',
    name: 'featureName',
    message: '请填写需求名称，建议使用 TAPD 需求单 ID：',
    filter: (value: String) => value.trim(),
    validate: (value: String): (Boolean | String) => {
        const validate = value.trim().split(' ').length === 1;
        return validate || '需求名称不能有空格';
    },
    transformer: (value: String) => `feature/${value}`
}];

const finishFeatureQuestions = [{
    type: 'input',
    name: 'featureName',
    message: '此操作将把 feature 分支合入 develop，请填写要结束的需求名称：',
    filter: (value: String) => value.trim(),
    validate: (value: String): (Boolean | String) => {
        const validate = value.trim().split(' ').length === 1;
        return validate || '需求名称不能有空格';
    },
    transformer: (value: String) => `feature/${value}`
}];


export async function start(featureName: string) {
    if (!featureName) {
        let answer: any = await inquirer.prompt(startFeatureQuestions);
        featureName = answer.featureName;
    }

    if (!featureName.startsWith('feature/')) {
        featureName = 'feature/' + featureName;
    }


    try {
        // 1.更新 develop 分支
        await Git.checkoutBranch('develop');
        await Git.pullWithRebase();

        // 2. 创建 feature 分支
        await Git.createBranchFrom(featureName, 'develop');
        await Git.checkoutBranch(featureName);
        console.log('feature 分支创建完成，当前所在分支 ->', chalk.yellowBright(featureName));
    } catch (e) {
        console.error(chalk.redBright(`分支创建失败, ${e}`));
    }

}


export async function finish(featureName: string) {
    const currentBranchName = await Git.getCurrentBranchName();
    if (!featureName) {

        // 先检查当前是否是 feature 分支
        if (currentBranchName.startsWith('feature/')) {
            let {use} = await inquirer.prompt([{
                type: 'input',
                name: 'use',
                message: `是否 finish 当前 feature 分支: ${currentBranchName} (y/n)：`,
                filter: (value: string) => value.trim(),
            }]);
            console.log('use', use);
            if (use === 'y' || use === 'Y') {
                featureName = currentBranchName;
            } else {
                let answer: any = await inquirer.prompt(finishFeatureQuestions);
                featureName = answer.featureName;
            }
        } else {
            let answer: any = await inquirer.prompt(finishFeatureQuestions);
            featureName = answer.featureName;
        }
    }

    if (!featureName.startsWith('feature/')) {
        featureName = 'feature/' + featureName;
    }

    try {
        if (currentBranchName !== 'develop') {
            Git.checkoutBranch('develop');
        }

        Git.pullWithRebase();

        // Git.mergeBranch(featureName, '--no-ff');
        await Git.mergeBranches('develop', featureName);

        console.info(chalk.greenBright(`需求【${featureName}】合入 develop 完成`));
    } catch (e) {
        console.error(chalk.redBright(`需求【${featureName}】合入 develop 失败`));
    }


    const {confirm} = await inquirer.prompt([{
        type: 'input',
        name: 'confirm',
        message: `是否需要删除 feature 分支【${featureName}】？(y/n)`,
    }]);

    if (confirm === 'y' || confirm === 'Y') {
        try {
            await Git.deleteBranch(featureName);
        } catch (e) {
            console.error(chalk.redBright(`需求【${featureName}】删除失败：${e}`));
        }
    }

}
