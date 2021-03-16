"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const git_1 = require("../utils/git");
const OS = tslib_1.__importStar(require("../utils/os"));
const date_1 = require("../utils/date");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const TagTypes = ['f', 't', 'v', 'g', 'p'];
const BranchesMap = {
    'p': 'rc',
    'g': 'gray',
    'v': 'master'
};
const createTagQuestions = [{
        type: 'rawlist',
        name: 'tagType',
        message: '请选择 tag 类型',
        filter: (value) => value.trim(),
        choices: [
            { name: '需求提测(f)', value: 'f' },
            { name: '测试环境(t)', value: 't' },
            { name: '预发布环境(p)', value: 'p' },
            { name: '灰度环境(g)', value: 'g' },
            { name: '正式环境(v)', value: 'v' },
            { name: '一键pgv(v)', value: 'pgv' },
        ],
        default: 1,
    }];
const initTagQuestions = [
    {
        type: 'input',
        name: 'tagPrefix',
        message: '请输入 tag 前缀，如 charge、pc：',
        filter: (value) => value.trim(),
        validate: (value) => {
            const trimValue = value.trim();
            if (!trimValue) {
                return 'tag 前缀不能为空';
            }
            const validate = trimValue.split(' ').length === 1;
            return validate || 'tag 前缀不能有空格';
        },
    },
];
const pushTagQuestions = [{
        type: 'input',
        name: 'needPush',
        message: '是否需要推送到远程？(y/n)',
        default: 'y'
    }];
async function create(tagType) {
    let tagConfig = await getTagConfig();
    if (!tagConfig) {
        console.error(chalk_1.default.redBright(`初始化失败，请找 Bubble`));
        return;
    }
    if (!tagType || !TagTypes.includes(tagType)) {
        let answer = await inquirer_1.default.prompt(createTagQuestions);
        tagType = answer.tagType;
    }
    let tags = [];
    // @ts-ignore
    const major = date_1.getYear();
    // 创建 pgv
    if (tagType === 'pgv') {
        for (let i = 0; i < tagType.length; i++) {
            // @ts-ignore
            await git_1.Git.checkoutBranch(BranchesMap[tagType[i]]);
            let tag = await createTagByTagType(tagType[i], tagConfig.prefix, major);
            if (tag) {
                tags.push(tag);
            }
        }
    }
    else {
        let tag = await createTagByTagType(tagType, tagConfig.prefix, major);
        if (tag) {
            tags.push(tag);
        }
    }
    if (tags.length) {
        OS.copyToClipboard(tags.join(' '));
        console.info(chalk_1.default.cyanBright(`tag 已经复制到剪贴板，粘贴给测试同学即可`));
    }
}
exports.create = create;
async function createTagByTagType(tagType, prefix, major) {
    let tag = '';
    try {
        // 1.更新当前分支
        try {
            await git_1.Git.pullWithRebase();
        }
        catch (e) {
            console.warn(chalk_1.default.yellowBright(`警告：该分支没有与远程分支关联，直接使用本地分支代码打 tag`));
        }
        // 2. 获取上次 tag
        let latestTag = git_1.Git.getLatestTag(tagType, prefix, major);
        // 3. 生成最新 tag
        let newTag = git_1.Git.generateNewTag(tagType, latestTag, prefix, major);
        console.log(`最近 ${tagType} tag ->`, chalk_1.default.gray(latestTag), '，即将创建 ->', chalk_1.default.blueBright(newTag));
        git_1.Git.createTag(newTag);
        console.log(`${tagType} tag 创建完成，最新 tag ->`, chalk_1.default.greenBright(newTag));
        let { needPush } = await inquirer_1.default.prompt(pushTagQuestions);
        if (needPush.toLowerCase() === 'y') {
            git_1.Git.pushTag(newTag);
        }
        tag = newTag;
    }
    catch (e) {
        console.error(chalk_1.default.redBright(`${tagType} tag 创建失败, ${e}`));
    }
    return tag;
}
exports.createTagByTagType = createTagByTagType;
async function show(tagType) {
    let tagConfig = await getTagConfig();
    if (!tagConfig) {
        console.error(chalk_1.default.redBright(`初始化失败，请找 Bubble`));
        return;
    }
    if (!tagType || !TagTypes.includes(tagType)) {
        let answer = await inquirer_1.default.prompt(createTagQuestions);
        tagType = answer.tagType;
    }
    try {
        // 1.更新当前分支
        try {
            await git_1.Git.pullWithRebase();
        }
        catch (e) {
        }
        // 2. 获取上次 tag
        let latestTag = git_1.Git.getLatestTag(tagType, tagConfig.prefix, date_1.getYear());
        console.log('最近 tag ->', chalk_1.default.greenBright(latestTag));
    }
    catch (e) {
        console.error(chalk_1.default.redBright(`获取 tag 失败, ${e}`));
    }
}
exports.show = show;
async function config() {
    try {
        const repository = await git_1.Git.discoverRepository();
        let answer = await inquirer_1.default.prompt(initTagQuestions);
        const tagPrefix = answer.tagPrefix;
        await git_1.Git.initTagConfig(repository, { prefix: tagPrefix });
        console.log(chalk_1.default.greenBright(`tag 格式配置成功, 后续 tag 打出来的格式如：${tagPrefix}-v${date_1.getYear()}.xx.xx`));
    }
    catch (e) {
        console.error(chalk_1.default.redBright(`配置 tag 失败, ${e}`));
    }
}
exports.config = config;
async function getTagConfig() {
    let res = null;
    try {
        const repository = await git_1.Git.discoverRepository();
        // 检查是否初始化
        const { prefix } = await git_1.Git.getTagConfig(repository);
        if (!prefix) {
            let answer = await inquirer_1.default.prompt(initTagQuestions);
            const tagPrefix = answer.tagPrefix;
            await git_1.Git.initTagConfig(repository, { prefix: tagPrefix });
            res = { prefix: tagPrefix };
        }
        else {
            res = { prefix };
        }
    }
    catch (e) {
        res = null;
        console.error(chalk_1.default.redBright(`无法找到 git 仓库，请在工程目录下执行 init. \n${e.message}`));
    }
    return res;
}
exports.getTagConfig = getTagConfig;
//
// export async function checkMajorVersion() {
//     const repository = await Git.discoverRepository();
//     const startYear = 2019;
//     const currentYear = new Date().getFullYear();
//     const newVersion = (currentYear - startYear) + 1;
//
//
//     if (newVersion !== +oldVersion) {
//         console.log(`🔈🔉🔊新的一年来啦🎉🎉🎉\n🧧🧧🧧祝大家都发财💰💰💰\n我们的版本也迎来升级 v${oldVersion} -> v${newVersion}，请各位朋友悉知\n⚠️注：版本号变更后，将影响打出的 tag`);
//     } else {
//         console.log('没有更新');
//     }
// }
