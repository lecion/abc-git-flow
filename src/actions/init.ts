import inquirer from "inquirer";
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


export async function init() {
    try {
        const repository = await Git.discoverRepository();

        // 检查是否初始化
        const isInit = await Git.isInit(repository);
        if (isInit) {
            console.info(chalk.greenBright('abc-flow 已经初始化过了'));
        } else {
            const code = await Git.initFlow(repository);
            if (code > 0) {
                console.info(chalk.greenBright('abc-flow 初始化成功'));
            } else {
                console.error(chalk.redBright('abc-flow 初始化失败：', code));
            }
        }
    } catch (e) {
        console.error(chalk.redBright(`无法找到 git 仓库，请在工程目录下执行 init. \n${e.message}`));
    }

}
