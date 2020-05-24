# gcommit-cli
自动化验证git commit 格式

# gcommit-cli

### 前言
在多人协作项目中，如果代码风格统一、代码提交信息的说明准确，那么在后期协作以及Bug处理时会更加方便。Git 每次提交代码，都要写 Commit message（提交说明），否则就不允许提交。一般来说，commit message 应该清晰明了，说明本次提交的目的。

Commit message 的作用
 
* 提供更多的历史信息，方便快速浏览
* 过滤某些commit（比如文档改动），便于快速查找信息
* 直接从commit生成Change log
* 可读性好，清晰，不必深入看代码即可了解当前commit的作用。
* 为 Code Reviewing（代码审查）做准备
* 方便跟踪工程历史
* 提高项目的整体质量，提高个人工程素质


Commit message 格式为

```
 <type>(<scope>): <subject>
// 空一行
<body>
// 空一行
<footer>
```
为了符合规范在这里 ```gcommit-cli``` 将做了一下几件事
* 在git commit 提交时对commit message格式验证,如果不符合则终止commit。
* 为了方便输入格式 加入了终端自动化流程选择格式信息。
* 在初始化阶段可以选择对提交对代码 配置代码格式化验证 比如在commit提交时通过配置eslit --fix 来修复代码不规范 如果修复失败则终止。
* 将所有用到对npm包依赖及基本配置全部自动生成。

# gcommit-cli 使用
```
 // 下载 gcommit-cli
 npm install gcommit-cli
 
 // 初始化依赖包及配置项
 npx gcommit-cli init
 
 // 初始化
 npm gcommit-cli init
 
 // 使用自动化选择message 
 
 npm run commit
 
```
#### 初始化中对选项：
* 输入安装依赖的工具包 默认是```npm```
* 是否在提交是对代码进行 ```prettier``` 格式化（格式化的规范按自身项目是否配置 ```prettier``` 规则 如果没有，则按官网默认规则）
* 是否在提交是对代码进行 ```eslint``` 格式化（格式化的规范按自身项目是否配置 ```eslint``` 规则 如果没有，则按默认规则）
* 是否默认使用```git add .``` (配置后 当运行 ```npm run commit``` 会将改命令自动运行)

## 注意点
* 所有生成的配置都可以在 ```package.json```中二次修改，直接影响运行结果
* 如果不使用 ```npm run commit``` 命令 直接使用 ```git cimmit -m xxxx``` 如果有配置格式化代码，会对代码进行格式化流程再对commit message进行验证

### 关于规则 

```
// 提交格式 类型 及描述为必填项

type (必填)<scope>(可选): subject(必填)
```

type 默认使用为 ```@commitlint/config-conventional```类型

###### 例如常用：
* feat：新功能（feature）
* fix：修补bug
* docs：文档（documentation）
* style： 格式（不影响代码运行的变动）
* refactor：重构（即不是新增功能，也不是修改bug的代码变动）
* test：增加测试
* chore：构建过程或辅助工具的变动

##### 当你需要配置自己的type替换默认的时

可以在根目录创建  ```.commit.js``` 或者在 ```package.json 中 配置 commit选项```
```
module.exports = [xxxxx]

or

commit: [xxxx]
```

##### 初始化后修改配置的方式有哪些
* 重新init选择
* 在package.json中修改配置

package增加的可配置项
```
// commitlint对象可配置规则 参考 npm包@commitlint/config-conventional

// config.commitizen 中的types对象的 description 属性 可以配置自动化选择时的type文案 

// husky.hook 对象中可以配置钩子命令 参考 git hooks

// lint-staged 对象可以配置代码格式化的流程 目前可选择支持 js, ts的处理 如果需要配置css,HTML 等可以自行增加

```
