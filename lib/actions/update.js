"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const net_1 = tslib_1.__importDefault(require("../utils/net"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const semver = tslib_1.__importStar(require("semver"));
const child_process_1 = require("child_process");
const progress_1 = tslib_1.__importDefault(require("progress"));
const updateQuestions = [{
        type: 'input',
        name: 'update',
        message: '检查到新版本，是否更新？(y/n)',
        default: 'y'
    }];
async function getRemoteVersion() {
    let version = '';
    let message = '';
    try {
        const response = await net_1.default.get('https://cd-cis-static-common.oss-cn-chengdu.aliyuncs.com/assets/abc-git-flow/manifest.json', {
            responseType: 'json'
        });
        //@ts-ignore
        version = response.body.version;
        //@ts-ignore
        message = response.body.message;
    }
    catch (e) {
    }
    return { version, message };
}
async function download(url, fileName, progressCb) {
    const downloadStream = net_1.default.stream(url);
    downloadStream.on('downloadProgress', process => {
        progressCb && progressCb(process);
    });
    const writeStream = fs_1.default.createWriteStream(fileName);
    downloadStream.pipe(writeStream);
}
async function check(currentVersion) {
    let { version: newVersion, message } = await getRemoteVersion();
    console.log('当前版本：', chalk_1.default.green(currentVersion), '最新版本：', chalk_1.default.green(newVersion));
    if (semver.gt(newVersion, currentVersion)) {
        let { update } = await inquirer_1.default.prompt(updateQuestions);
        if (update.toLowerCase() === 'y') {
            let bar = null;
            await download('https://cd-cis-static-common.oss-cn-chengdu.aliyuncs.com/assets/abc-git-flow/git-abc-macos', 'git-abc', (process) => {
                if (!bar) {
                    bar = new progress_1.default('下载中 [:bar] :percent', {
                        complete: '=',
                        incomplete: ' ',
                        width: 100,
                        total: process.total
                    });
                }
                bar.update(process.percent);
                if (process.percent === 1) {
                    child_process_1.execSync(`chmod a+x git-abc`);
                    child_process_1.execSync(`mv ./git-abc /usr/local/bin/git-abc`);
                    console.log(chalk_1.default.green(`更新完成，最新版本: ${newVersion}`));
                    if (message)
                        console.log(chalk_1.default.white(`更新信息: \n${message}`));
                }
            });
        }
    }
    else {
        console.log('已经是最新版本，无需更新');
    }
}
exports.check = check;
