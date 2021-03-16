import inquirer from "inquirer";
import {Git} from "../utils/git";
import * as OS from "../utils/os";
import {getYear, validateYear} from "../utils/date";
import chalk from "chalk";

const TagTypes = ['f', 't', 'v', 'g', 'p'];

const BranchesMap = {
    'p': 'rc',
    'g': 'gray',
    'v': 'master'
}

const createTagQuestions = [{
    type: 'rawlist',
    name: 'tagType',
    message: '请选择 tag 类型',
    filter: (value: String) => value.trim(),
    choices: [
        {name: '需求提测(f)', value: 'f'},
        {name: '测试环境(t)', value: 't'},
        {name: '预发布环境(p)', value: 'p'},
        {name: '灰度环境(g)', value: 'g'},
        {name: '正式环境(v)', value: 'v'},
        {name: '一键pgv(v)', value: 'pgv'},
    ],
    default: 1,
}];

const initTagQuestions = [
        {
            type: 'input',
            name: 'tagPrefix',
            message: '请输入 tag 前缀，如 charge、pc：',
            filter: (value: String) => value.trim(),
            validate: (value: String): (Boolean | String) => {
                const trimValue = value.trim();
                if (!trimValue) {
                    return 'tag 前缀不能为空'
                }
                const validate = trimValue.split(' ').length === 1;
                return validate || 'tag 前缀不能有空格';
            },
        },
    ]
;

const pushTagQuestions = [{
    type: 'input',
    name: 'needPush',
    message: '是否需要推送到远程？(y/n)',
    default: 'y'
}];


export async function create(tagType: string) {
    let tagConfig = await getTagConfig();
    if (!tagConfig) {
        console.error(chalk.redBright(`初始化失败，请找 Bubble`));
        return;
    }

    if (!tagType || !TagTypes.includes(tagType)) {
        let answer: any = await inquirer.prompt(createTagQuestions);
        tagType = answer.tagType;
    }

    let tags = [];

    // @ts-ignore
    const major = getYear();

    // 创建 pgv
    if (tagType === 'pgv') {
        for (let i = 0; i < tagType.length; i++) {
            // @ts-ignore
            await Git.checkoutBranch(BranchesMap[tagType[i]]);
            let tag = await createTagByTagType(tagType[i], tagConfig.prefix, major);
            if (tag) {
                tags.push(tag);
            }
        }
    } else {
        let tag = await createTagByTagType(tagType, tagConfig.prefix, major);
        if (tag) {
            tags.push(tag);
        }
    }
    if (tags.length) {
        OS.copyToClipboard(tags.join(' '));
        console.info(chalk.cyanBright(`tag 已经复制到剪贴板，粘贴给测试同学即可`))
    }
}

export async function createTagByTagType(tagType: string, prefix: string, major: string) {
    let tag = '';
    try {
        // 1.更新当前分支
        try {
            await Git.pullWithRebase();
        } catch (e) {
            console.warn(chalk.yellowBright(`警告：该分支没有与远程分支关联，直接使用本地分支代码打 tag`));
        }

        // 2. 获取上次 tag
        let latestTag = Git.getLatestTag(tagType, prefix, major);

        // 3. 生成最新 tag
        let newTag = Git.generateNewTag(tagType, latestTag, prefix, major);
        console.log(`最近 ${tagType} tag ->`, chalk.gray(latestTag), '，即将创建 ->', chalk.blueBright(newTag));

        Git.createTag(newTag);

        console.log(`${tagType} tag 创建完成，最新 tag ->`, chalk.greenBright(newTag));

        let {needPush} = await inquirer.prompt(pushTagQuestions);
        if (needPush.toLowerCase() === 'y') {
            Git.pushTag(newTag);
        }
        tag = newTag;
    } catch (e) {
        console.error(chalk.redBright(`${tagType} tag 创建失败, ${e}`));
    }
    return tag;

}

export async function show(tagType: any) {
    let tagConfig = await getTagConfig();
    if (!tagConfig) {
        console.error(chalk.redBright(`初始化失败，请找 Bubble`));
        return;
    }
    if (!tagType || !TagTypes.includes(tagType)) {
        let answer: any = await inquirer.prompt(createTagQuestions);
        tagType = answer.tagType;
    }

    try {
        // 1.更新当前分支
        try {
            await Git.pullWithRebase();
        } catch (e) {
        }

        // 2. 获取上次 tag
        let latestTag = Git.getLatestTag(tagType, tagConfig.prefix, getYear());

        console.log('最近 tag ->', chalk.greenBright(latestTag));
    } catch (e) {
        console.error(chalk.redBright(`获取 tag 失败, ${e}`));
    }
}

export async function config() {
    try {
        const repository = await Git.discoverRepository();
        let answer: any = await inquirer.prompt(initTagQuestions);
        const tagPrefix = answer.tagPrefix;

        await Git.initTagConfig(repository, {prefix: tagPrefix});
        console.log(chalk.greenBright(`tag 格式配置成功, 后续 tag 打出来的格式如：${tagPrefix}-v${getYear()}.xx.xx`));
    } catch (e) {
        console.error(chalk.redBright(`配置 tag 失败, ${e}`));
    }
}


export async function getTagConfig() {
    let res = null;
    try {
        const repository = await Git.discoverRepository();

        // 检查是否初始化
        const {
            prefix
        } = await Git.getTagConfig(repository);

        if (!prefix) {
            let answer: any = await inquirer.prompt(initTagQuestions);
            const tagPrefix = answer.tagPrefix;

            await Git.initTagConfig(repository, {prefix: tagPrefix});
            res = {prefix: tagPrefix};
        } else {
            res = {prefix};
        }
    } catch (e) {
        res = null;
        console.error(chalk.redBright(`无法找到 git 仓库，请在工程目录下执行 init. \n${e.message}`));
    }
    return res;
}
