"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const nodegit_1 = tslib_1.__importDefault(require("nodegit"));
const path_1 = tslib_1.__importDefault(require("path"));
const ConfigRequiredKeys = [
    // branch
    'abcflow.branch.master',
    'abcflow.branch.gray',
    'abcflow.branch.rc',
    'abcflow.branch.develop',
    // prefix
    'abcflow.prefix.feature',
    'abcflow.prefix.hotfix',
    'abcflow.prefix.hotfix-g',
];
class Git {
    /**
     * @desc 获取当前分支名
     * @author bubble
     * @date 2020/03/12 23:19:37
     * @params
     * @return
     */
    static getCurrentBranchName() {
        return child_process_1.execSync(`git status | awk '/^On branch/ {print $3}'`, { encoding: 'utf-8' });
    }
    static newBranch(name) {
        child_process_1.execSync(`git checkout -b ${name} > /dev/null`, { encoding: 'utf-8' });
    }
    static checkBranch(branchName) {
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
        child_process_1.execSync(`git merge ${branchName} ${optionsStr}`);
    }
    static async testNodeGit() {
        console.log(path_1.default.resolve(__dirname, '../../'));
        const repository = await nodegit_1.default.Repository.open(path_1.default.resolve(__dirname, '../../'));
        const commit = await repository.getBranchCommit('master');
        // await repository.createBranch('ttt', commit);
        const config = await nodegit_1.default.Config.openDefault();
        return true;
    }
    static async testDiscover() {
        const res = await nodegit_1.default.Repository.discover(process.cwd(), 0, '');
        console.log('res', res);
        return res;
    }
}
exports.Git = Git;
