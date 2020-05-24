#!/usr/bin/env node

"use strict"
const path = require('path')
const editJsonFile = require("edit-json-file")
const p = require('@commitlint/config-conventional')
const arg = process.argv
const {
    prompt,
    MultiSelect
} = require('enquirer')
let npmName = 'npm'
let formatType = (ruls = []) => {
    let type = {}
    ruls.forEach(item => {
        type[item] = {
            "description": "type is " + item,
            "title": item
        }
    })
    return type
}
// 初始化commit ,将部分脚本写入到package.json中
if (arg[2] && arg[2] === 'init') {
    let file = editJsonFile(`${process.cwd()}/package.json`)
    let hooks = {
        "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
    let husky = file.get('husky') || {}
    husky.hooks = Object.assign(husky.hooks || {}, hooks)
    let userCommit = []
    let defalutType = p.rules['type-enum'][2].filter(item => item != "improvement")
    try {
        userCommit = require(path.join(__dirname, './.commit.js'))

    } catch (err) {
        userCommit = file.get('commit') || defalutType
        userCommit = userCommit.length > 0 ? userCommit : defalutType
    }
    // console.log(userCommit)
    let commitlint = {
        "extends": [
            "@commitlint/config-conventional"
        ],
        "rules": {
            "type-enum": [2, "always", defalutType]
        }
    }
    if (userCommit.length > 0) {
        commitlint.rules["type-enum"] = [2, "always", userCommit]
        let types = formatType(userCommit)
        let config = file.get('config') || {}
        config.commitizen = Object.assign(config.commitizen || {}, { types })
        file.set('config', config)
    }
    file.set('commitlint', commitlint)
    const question = [{
        type: 'input',
        name: 'npmName',
        message: '请填写安装依赖使用工具, 默认为npm'
    },
    {
        type: 'Select',
        name: 'prettier',
        message: 'commit 前是否对提交代码进行 prettier 格式化',
        choices: ['yes', 'no']
    },
    {
        type: 'Select',
        name: 'eslint',
        message: 'commit 前是否对提交代码进行 eslint 格式化',
        choices: ['yes', 'no']
    },
    {
        type: 'Select',
        name: 'order',
        message: '是否默认使用git add .',
        choices: ['yes', 'no']
    }
    ]

    prompt(question)
        .then(async answer => {
            let isShowMultiSelect = false
            let choices = []
            let guize = {
                js: [],
                ts: []
            }
            npmName = answer.npmName || npmName
            if (answer.prettier == 'yes') {
                isShowMultiSelect = true
                guize.js.push('prettier --write')
                guize.ts.push('prettier --write')
            }
            if (answer.eslint == 'yes') {
                isShowMultiSelect = true
                guize.js.push('eslint --fix')
                guize.ts.push('eslint --fix')
            }
            choices = [{
                name: 'js',
                value: {
                    'src/**/*.{js,jsx}': guize.js
                }
            },
            {
                name: 'ts',
                value: {
                    'src/**/*.{ts,tsx}': guize.ts
                }
            }
            ]
            let pro = new MultiSelect({
                type: 'MultiSelect',
                nmae: 'value',
                limit: 2,
                message: '请按空格选择格式化匹配规则（多选）？',
                choices: choices,
                result(names) {
                    return this.map(names)
                }
            })
            if (isShowMultiSelect) {
                let answer = await pro.run()
                let lint = file.get('lint-staged') || {}
                let lints = Object.assign(lint, {
                    ...answer.js,
                    ...answer.ts
                })
                if (Object.keys(answer).length > 0) {
                    husky.hooks["pre-commit"] = "lint-staged"
                    file.set("lint-staged", lints)
                }
            }
            file.set("husky", husky)
            let scripts = file.get('scripts')
            let objects = Object.assign(scripts, {
                "commit": answer.order === 'yes' ? 'git add . && cross-env ./node_modules/.bin/my-commit' : 'cross-env ./node_modules/.bin/my-commit'
            })
            file.save()
            console.log('分析依赖中...')
            let devDependencies = file.get('devDependencies')
            let dependencies = file.get('dependencies')
            let yilai = [
                'husky',
                'cross-env',
                'cz-conventional-changelog',
                'commitizen',
                '@commitlint/cli',
                '@commitlint/config-conventional'
            ].filter(item => {
                return !devDependencies[item] || dependencies[item]
            })
            if (yilai.length > 0) {
                let shell = require('shelljs')
                let allYilai = yilai.join(' ')
                console.log('开始安装依赖', `${npmName} i ${allYilai} --save-dev`)
                // console.log(`正在安装 ${allYilai}---- `)
                shell.exec(`${npmName} i ${allYilai} --save-dev`, {
                    async: true
                })
                // console.log('初始化完成...， 可以使用 npm run commit 命令代替git commit操作')
            }
            console.log('初始化完成 可以使用 npm run commit 命令代替git commit操作')
        })
        .catch(console.error)
} else {
    const bootstrap = require('commitizen/dist/cli/git-cz').bootstrap
    bootstrap({
        cliPath: path.join(__dirname, '../node_modules/commitizen'),
        // this is new
        config: {
            "path": "cz-conventional-changelog"
            // "path": "cz-emoji"
        }
    })
}
