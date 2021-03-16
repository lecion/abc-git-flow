ABC GIT FLOW 工作流，用法：git abc commands

```
Options:
  -v, --version               output the version number
  -h, --help                  output usage information

Commands:
  init                        初始化 Git 仓库，以支持 abc-flow。该操作会初始化 gray/rc/develop 分支，并推送到远程
  feature [op] [featureName]  管理特性分支
                                * feature start         [此操作将会从 develop 拉取开发分支]
                                * feature finish        [此操作将会把 feature 分支合回 develop 分支]
  
  hotfix [op] [hotfixName]    管理 正式环境的 hotfix 分支
                                * hotfix start          [此操作将从 master 拉取 hotfix 分支，用于修复正式环境紧急 BUG]
                                * hotfix finish         [此操作将把 hotfix 分支合入 master/gray/rc/develop 分支，合入后请注意 push 代码]
  
  hotfix-g [op] [hotfixName]  管理 灰度环境的 hotfix-g 分支
                                * hotfix-g start        [此操作将从 gray 拉取 hotfix-g 分支，用于修复灰度环境紧急 BUG]
                                * hotfix-g finish       [此操作将把 hotfix-g 分支合入 gray/rc/develop 分支，合入后请注意 push 代码]
  
  rc [op]                     管理 rc 分支
                                * rc start              [此操作将会把 develop 合入 rc 分支]
                                * rc finish             [此操作将会把 rc 合入 gray 分支]
  
  gray [op]                   管理 gray 分支
                                * gray publish          [此操作将会把 gray 合入 master 分支，完成灰度到全量的过程，合入后请注意 push 代码]
  
  tag [op] [tagType]          管理 tag
                                * tag create            [创建 tag]
                                * tag show              [查看最近 tag]
                                * tag config            [配置 tag 前缀，大版本号等]
  
  update                      更新 git-abc

```
