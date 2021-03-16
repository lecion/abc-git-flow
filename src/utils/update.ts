import net from './net';
import * as semver from 'semver';
import * as fs from "fs";
import {execSync} from "child_process";


async function getRemoteVersion() {
    let version = '';
    try {
        const response = await net.get('https://cd-cis-static-common.oss-cn-chengdu.aliyuncs.com/assets/abc-git-flow/manifest.json', {
            responseType: 'json'
        });
        //@ts-ignore
        version = response.body.version;
    } catch (e) {

    }
    return version;
}

async function download(url: string, fileName: string, progressCb: Function) {
    const downloadStream = net.stream(url);

    downloadStream.on('downloadProgress', process => {
        progressCb && progressCb(process.percent);
    })

    const writeStream = fs.createWriteStream(fileName);

    downloadStream.pipe(writeStream);

}

export async function checkUpdate(currentVersion: string) {
    let newVersion = await getRemoteVersion();
    console.log('当前版本：', currentVersion, '最新版本：', newVersion);
    if (semver.gt(newVersion, currentVersion)) {
        console.log('即将下载最新版本');
        await download('https://cis-static-common.oss-cn-shanghai.aliyuncs.com/assets/abc-git-flow/git-abc-macos',
            'git-abc',
            (progress: number) => {
                let percent = (progress * 100).toFixed(2);
                console.log("下载进度", percent + '%');
            });
        execSync(`chmod a+x git-abc`);
        execSync(`mv ./git-abc /usr/local/bin/git-abc`);
        console.log('更新完成');
    } else {
        console.log('已经是最新版本，无需更新');
    }
}
