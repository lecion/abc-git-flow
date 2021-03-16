"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const net_1 = tslib_1.__importDefault(require("./net"));
const semver = tslib_1.__importStar(require("semver"));
const fs = tslib_1.__importStar(require("fs"));
const child_process_1 = require("child_process");
async function getRemoteVersion() {
    let version = '';
    try {
        const response = await net_1.default.get('https://cd-cis-static-common.oss-cn-chengdu.aliyuncs.com/assets/abc-git-flow/manifest.json', {
            responseType: 'json'
        });
        //@ts-ignore
        version = response.body.version;
    }
    catch (e) {
    }
    return version;
}
async function download(url, fileName, progressCb) {
    const downloadStream = net_1.default.stream(url);
    downloadStream.on('downloadProgress', process => {
        progressCb && progressCb(process.percent);
    });
    const writeStream = fs.createWriteStream(fileName);
    downloadStream.pipe(writeStream);
}
async function checkUpdate(currentVersion) {
    let newVersion = await getRemoteVersion();
    console.log('当前版本：', currentVersion, '最新版本：', newVersion);
    if (semver.gt(newVersion, currentVersion)) {
        console.log('即将下载最新版本');
        await download('https://cis-static-common.oss-cn-shanghai.aliyuncs.com/assets/abc-git-flow/git-abc-macos', 'git-abc', (progress) => {
            let percent = (progress * 100).toFixed(2);
            console.log("下载进度", percent + '%');
        });
        child_process_1.execSync(`chmod a+x git-abc`);
        child_process_1.execSync(`mv ./git-abc /usr/local/bin/git-abc`);
        console.log('更新完成');
    }
    else {
        console.log('已经是最新版本，无需更新');
    }
}
exports.checkUpdate = checkUpdate;
