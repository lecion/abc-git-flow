"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const nodegit_1 = tslib_1.__importDefault(require("nodegit"));
const configRequiredMap = {
    // branch
    'abcflow.branch.master': 'master',
    'abcflow.branch.gray': 'gray',
    'abcflow.branch.rc': 'rc',
    'abcflow.branch.develop': 'develop',
    // prefix
    'abcflow.prefix.feature': 'feature/',
    'abcflow.prefix.hotfix': 'hotfix/',
    'abcflow.prefix.hotfix-g': 'hotfix-g/',
};
const TAG_PREFIX_KEY = 'abcflow.prefix.tag';
class Git {
    /**
     * @desc 获取当前分支名
     * @author bubble
     * @date 2020/03/12 23:19:37
     * @params
     * @return
     */
    static async getCurrentBranchName() {
        const repo = await this.discoverRepository();
        const currentBranch = await repo.getCurrentBranch();
        return currentBranch.shorthand();
        // return execSync(`git status | awk '/^On branch/ {print $3}'`, {encoding: 'utf-8'});
    }
    static newBranch(name) {
        child_process_1.execSync(`git checkout -b ${name} > /dev/null`, { encoding: 'utf-8' });
    }
    static checkoutBranch(branchName) {
        child_process_1.execSync(`git checkout ${branchName}`);
    }
    static pullWithRebase() {
        child_process_1.execSync(`git pull --rebase`);
    }
    static mergeBranch(branchName, options) {
        if (typeof options === 'string') {
            options = [options];
        }
        let optionsStr = '';
        if (Array.isArray(options)) {
            optionsStr = options.join(' ');
        }
        child_process_1.execSync(`git merge ${optionsStr} ${branchName}`);
    }
    static async createBranchFrom(targetName, upstreamBranchName) {
        const repo = await this.discoverRepository();
        await this.initBranch(repo, targetName, upstreamBranchName);
    }
    // static async checkoutBranch(branchName: string) {
    //     const repo = await this.discoverRepository();
    //     await repo.checkoutBranch(branchName);
    // }
    static async mergeBranches(to, from, fastForward = false) {
        // const repo = await this.discoverRepository();
        // await repo.mergeBranches(to, from, undefined, NodeGit.Merge.PREFERENCE.NO_FASTFORWARD);
        this.checkoutBranch(to);
        this.mergeBranch(from, fastForward ? '' : '--no-ff');
    }
    static async discoverRepository() {
        const path = await nodegit_1.default.Repository.discover(process.cwd(), 0, '');
        return nodegit_1.default.Repository.open(path.toString());
    }
    static async isInit(repository) {
        const config = await repository.config();
        const invalidConfigKey = [];
        const configRequiredKeys = Object.keys(configRequiredMap);
        for (let i = 0, len = configRequiredKeys.length; i < len; i++) {
            const key = configRequiredKeys[i];
            try {
                const value = await config.getStringBuf(key);
                if (!value) {
                    invalidConfigKey.push(key);
                }
            }
            catch (e) {
                invalidConfigKey.push(key);
            }
        }
        return invalidConfigKey.length === 0;
    }
    /**
     * @desc 初始化 abc git flow：1. 创建对应的分支；2. 配置 config
     * @author bubble
     * @date 2020/03/15 17:12:52
     * @params
     * @return
     */
    static async initFlow(repository) {
        const config = await repository.config();
        const configRequiredKeys = Object.keys(configRequiredMap);
        let code = 1;
        // 1. 创建对应的分支
        try {
            // 2.1 查找 master 分支
            await nodegit_1.default.Branch.lookup(repository, 'master', 1 /* LOCAL */);
            // 2.2 初始化 gray 分支
            await this.initBranch(repository, 'gray', 'master', true);
            // 2.3 初始化 develop 分支
            await this.initBranch(repository, 'develop', 'gray', true);
            // 2.4 初始化 rc 分支
            await this.initBranch(repository, 'rc', 'develop', true);
        }
        catch (e) {
            console.error('initFlow createBranch failed', e);
            code = -1;
        }
        // 2. 配置 config
        for (let i = 0, len = configRequiredKeys.length; i < len; i++) {
            const key = configRequiredKeys[i];
            const value = configRequiredMap[key];
            try {
                await config.setString(key, value);
            }
            catch (e) {
                console.error('initFlow config failed.', e);
                code = -2;
            }
        }
        return code;
    }
    /**
     * @desc 初始化分支
     * @author bubble
     * @date 2020/03/15 17:37:10
     * @param {Repository} repository 仓库
     * @param {string} branchName 要创建的分支名
     * @param {string} upstreamBranchName 上游分支名
     * @param {boolean} needSetUpstream 是否需要设置 upstream
     * @return
     */
    static async initBranch(repository, branchName, upstreamBranchName, needSetUpstream = false) {
        try {
            // 查找本地的分支
            await nodegit_1.default.Branch.lookup(repository, branchName, 1 /* LOCAL */);
        }
        catch (e) {
            let commit;
            try {
                // 没有找到 本地的分支，尝试从远程拉取
                commit = await repository.getBranchCommit(`refs/remotes/origin/${branchName}`);
            }
            catch (e) {
                // 从远程拉取失败，说明该分支没有创建，需要从 上游分支 创建一个
                commit = await repository.getBranchCommit(upstreamBranchName);
            }
            // 创建 分支
            await repository.createBranch(branchName, commit.id());
            if (needSetUpstream) {
                this.pushWithSetUpstream(branchName);
            }
        }
    }
    static pushWithSetUpstream(name) {
        child_process_1.execSync(`git push --set-upstream origin ${name}`);
    }
    static async deleteBranch(branchName) {
        const repo = await this.discoverRepository();
        const branch = await nodegit_1.default.Branch.lookup(repo, branchName, 1 /* LOCAL */);
        await nodegit_1.default.Branch.delete(branch);
    }
    static listTag(tagType, prefix, major) {
        try {
            return child_process_1.execSync(`git tag | grep -F ${prefix}-${tagType}${major}.`, { encoding: 'utf-8' });
        }
        catch (e) {
            return '';
        }
    }
    static getLatestTag(tagType, prefix, major) {
        let tag = '';
        let tags = this.listTag(tagType, prefix, major);
        let tagArr = tags.split('\n');
        const length = tagArr.length;
        if (length) {
            for (let i = tagArr.length - 1; i >= 0; i--) {
                if (tagArr[i] !== '') {
                    tag = tagArr[i];
                    break;
                }
            }
        }
        return tag;
    }
    static createTag(tagName) {
        child_process_1.execSync(`git tag ${tagName}`);
    }
    static generateNewTag(tagType, latestTag, prefix, major) {
        const weekOfYear = this.getWeekOfYear();
        const tagPrefix = `${prefix}-${tagType}${major}.${this.prefixZero(weekOfYear, 2)}.`;
        let buildNum = '01';
        if (latestTag) {
            // mc-t2.37.47  -> 37
            let tagWeekOfYear = +latestTag.split('.')[1];
            // 相同才取 buildNum
            if (tagWeekOfYear === weekOfYear) {
                let latestBuildNum = +latestTag.split('.')[2];
                latestBuildNum++;
                buildNum = this.prefixZero(latestBuildNum, 2);
            }
        }
        return tagPrefix + buildNum;
    }
    static pushTag(newTag) {
        child_process_1.execSync(`git push origin ${newTag}`);
    }
    static async getTagConfig(repository) {
        const config = await repository.config();
        try {
            const prefix = await config.getStringBuf(TAG_PREFIX_KEY);
            return { prefix };
        }
        catch (e) {
        }
        return {};
    }
    static async getTagPrefix(repository) {
        const config = await repository.config();
        let prefix = '';
        try {
            const buf = await config.getStringBuf(TAG_PREFIX_KEY);
            prefix = buf + '';
        }
        catch (e) {
        }
        return prefix;
    }
    static async initTagConfig(repository, options) {
        const config = await repository.config();
        let code = 1;
        try {
            await config.setString(TAG_PREFIX_KEY, options.prefix);
        }
        catch (e) {
            console.error('initTagConfig config failed.', e);
            code = -1;
        }
        return code;
    }
    static getWeekOfYear() {
        const today = new Date();
        let firstDay = new Date(today.getFullYear(), 0, 1);
        const dayOfWeek = firstDay.getDay();
        let spendDay = 1;
        if (dayOfWeek != 0) {
            spendDay = 7 - dayOfWeek + 1;
        }
        firstDay = new Date(today.getFullYear(), 0, 1 + spendDay);
        const d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000);
        const result = Math.ceil(d / 7);
        return result + 1;
    }
    ;
    static prefixZero(num, n) {
        return (Array(n).join('0') + num).slice(-n);
    }
}
exports.Git = Git;
