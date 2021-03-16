"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = tslib_1.__importDefault(require("commander"));
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const Init = tslib_1.__importStar(require("./actions/init"));
const Feature = tslib_1.__importStar(require("./actions/feature"));
const Hotfix = tslib_1.__importStar(require("./actions/hotfix"));
const HotfixG = tslib_1.__importStar(require("./actions/hotfix-g"));
const RC = tslib_1.__importStar(require("./actions/rc"));
const Gray = tslib_1.__importStar(require("./actions/gray"));
const Tag = tslib_1.__importStar(require("./actions/tag"));
const Update = tslib_1.__importStar(require("./actions/update"));
const pkg = require('../package.json');
commander_1.default
    .version(pkg.version, '-v, --version')
    .description('ABC GIT FLOW 工作流，用法：git abc commands');
commander_1.default
    .command('init')
    .description(`初始化 Git 仓库，以支持 abc-flow。该操作会初始化 gray/rc/develop 分支，并推送到远程\n`)
    .action(() => {
    Init.init();
});
commander_1.default
    .command('feature [op] [featureName]')
    .description(`管理特性分支\n\t\t\t\t* feature start\t\t[此操作将会从 develop 拉取开发分支]\n\t\t\t\t* feature finish\t[此操作将会把 feature 分支合回 develop 分支]\n`)
    .action((op, featureName, cmd) => {
    if (op === 'start') {
        Feature.start(featureName);
    }
    else if (op === 'finish') {
        Feature.finish(featureName);
    }
    else {
        console.error(chalk_1.default.redBright(`未知操作 ${op}`, 'op 只能是 [start, finish]'));
    }
});
commander_1.default
    .command('hotfix [op] [hotfixName]')
    .description(`管理 正式环境的 hotfix 分支\n\t\t\t\t* hotfix start\t\t[此操作将从 master 拉取 hotfix 分支，用于修复正式环境紧急 BUG]\n\t\t\t\t* hotfix finish\t\t[此操作将把 hotfix 分支合入 master/gray/rc/develop 分支，合入后请注意 push 代码]\n`)
    .action((op, hotfixName, cmd) => {
    if (op === 'start') {
        Hotfix.start(hotfixName);
    }
    else if (op === 'finish') {
        Hotfix.finish(hotfixName);
    }
    else {
        console.error(chalk_1.default.redBright(`未知操作 ${op}`, 'op 只能是 [start, finish]'));
    }
});
commander_1.default
    .command('hotfix-g [op] [hotfixName]')
    .description(`管理 灰度环境的 hotfix-g 分支\n\t\t\t\t* hotfix-g start\t[此操作将从 gray 拉取 hotfix-g 分支，用于修复灰度环境紧急 BUG]\n\t\t\t\t* hotfix-g finish\t[此操作将把 hotfix-g 分支合入 gray/rc/develop 分支，合入后请注意 push 代码]\n`)
    .action((op, hotfixName, cmd) => {
    if (op === 'start') {
        HotfixG.start(hotfixName);
    }
    else if (op === 'finish') {
        HotfixG.finish(hotfixName);
    }
    else {
        console.error(chalk_1.default.redBright(`未知操作 ${op}`, 'op 只能是 [start, finish]'));
    }
});
commander_1.default
    .command('rc [op]') //'合入 develop，完成新特性的开发'
    .description(`管理 rc 分支\n\t\t\t\t* rc start\t\t[此操作将会把 develop 合入 rc 分支]\n\t\t\t\t* rc finish\t\t[此操作将会把 rc 合入 gray 分支]\n`)
    .action((op) => {
    if (op === 'start') {
        RC.start();
    }
    else if (op === 'finish') {
        RC.finish();
    }
    else {
        console.error(chalk_1.default.redBright(`未知操作 ${op}`, 'op 只能是 [start, finish]'));
    }
});
commander_1.default
    .command('gray [op]')
    .description(`管理 gray 分支\n\t\t\t\t* gray publish\t\t[此操作将会把 gray 合入 master 分支，完成灰度到全量的过程，合入后请注意 push 代码]\n`)
    .action((op) => {
    if (op === 'publish') {
        Gray.publish();
    }
    else {
        console.error(chalk_1.default.redBright(`未知操作 ${op}`, 'op 只能是 [publish]'));
    }
});
commander_1.default
    .command('tag [op] [tagType]')
    .description(`管理 tag\n\t\t\t\t* tag create\t\t[创建 tag]\n\t\t\t\t* tag show\t\t[查看最近 tag]\n\t\t\t\t* tag config\t\t[配置 tag 前缀，大版本号等]\n`)
    .action((op, tagType) => {
    if (op === 'create') {
        Tag.create(tagType);
    }
    else if (op === 'config') {
        Tag.config();
    }
    else if (op === 'show' || !op) {
        Tag.show(tagType);
    }
    else {
        console.error(chalk_1.default.redBright(`未知操作 ${op}`, 'op 只能是 [create]'));
    }
});
commander_1.default
    .command('update')
    .description(`更新 git-abc`)
    .action(() => {
    Update.check(pkg.version);
});
// commander.help((msg) => {
//     // console.log(
//     //     chalk.red(
//     //         figlet.textSync('ABC GIT FLOW', {
//     //             horizontalLayout: 'full'
//     //         })
//     //     )
//     // );
//     return msg;
// })
commander_1.default.parse(process.argv);
