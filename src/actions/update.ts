import inquirer from "inquirer";
import chalk from "chalk";
import net from "../utils/net";
import fs from "fs";
import * as semver from "semver";
import {execSync} from "child_process";
import ProgressBar from 'progress';


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
        const response = await net.get('https://cd-cis-static-common.oss-cn-chengdu.aliyuncs.com/assets/abc-git-flow/manifest.json', {
            responseType: 'json'
        });
        //@ts-ignore
        version = response.body.version;
        //@ts-ignore
        message = response.body.message;
    } catch (e) {

    }
    return {version, message};
}

async function download(url: string, fileName: string, progressCb: Function) {
    const downloadStream = net.stream(url);

    downloadStream.on('downloadProgress', process => {
        progressCb && progressCb(process);
    })

    const writeStream = fs.createWriteStream(fileName);

    downloadStream.pipe(writeStream);

}

export async function check(currentVersion: string) {
    let {version: newVersion, message} = await getRemoteVersion();
    console.log('当前版本：', chalk.green(currentVersion), '最新版本：', chalk.green(newVersion));

    if (semver.gt(newVersion, currentVersion)) {

        let {update} = await inquirer.prompt(updateQuestions);
        if (update.toLowerCase() === 'y') {
            let bar: any = null;
            await download('https://cd-cis-static-common.oss-cn-chengdu.aliyuncs.com/assets/abc-git-flow/git-abc-macos',
                'git-abc',
                (process: any) => {
                    if (!bar) {
                        bar = new ProgressBar('下载中 [:bar] :percent', {
                            complete: '=',
                            incomplete: ' ',
                            width: 100,
                            total: process.total
                        });
                    }
                    bar.update(process.percent);

                    if (process.percent === 1) {
                        execSync(`chmod a+x git-abc`);
                        execSync(`mv ./git-abc /usr/local/bin/git-abc`);
                        console.log(chalk.green(`更新完成，最新版本: ${newVersion}`));
                        if (message)
                            console.log(chalk.white(`更新信息: \n${message}`));
                    }
                });
        }
    } else {
        console.log('已经是最新版本，无需更新');
    }
}
