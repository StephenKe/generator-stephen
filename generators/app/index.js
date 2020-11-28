const Generator = require('yeoman-generator')
const Task = require('shell-task')
const init = require('init-package-json')
const path = require('path')


  // 继承 yeoman-generator 类
module.exports = class extends Generator {
    answers = {}
    // 命令行询问
    prompting () {
        const _this = this
        // 定义 this.prompt async 函数
        const promptAsync = async function () {
            _this.answers = await _this.prompt([
                {
                    // 询问项目名称
                    type: 'input',
                    // 存储的 key，作为模版文件的键值填充
                    name: 'name',
                    message: 'Your project name',
                    default: 'stephen' 
                },
                {
                    // 选择生成目录结构使用的框架
                    type: 'list',
                    name: 'framework',
                    message: 'choose a framework',
                    choices: ['Vue', 'React', 'Simple'],
                    default: 'Vue'
                },
            ])
            // 选择了 Vue/React 直接跑官方 cli，中断后续执行
            if (_this.answers.framework !== 'Simple') return
            // 选择了 Simple 则继续询问
            _this.answers = Object.assign(_this.answers, await _this.prompt([
                {
                    // 是否执行 git init
                    type: 'confirm',
                    name: 'git',
                    message: 'git init?',
                    default: true
                },
                {
                    // 是否执行 git npm
                    type: 'confirm',
                    name: 'npm',
                    message: 'npm init?',
                    default: true
                }
            ])) 
        }
        // 执行 async 函数
        return promptAsync()
    }
    // 生成器具体写入到工作目录的操作
    writing () {
        const {name, framework, git, npm} = this.answers
        // 选择 Simple 的处理
        if (framework === 'Simple') {
            // 新建名称为 ${name} 的文件夹
            new Task(`mkdir ${name}`)
                .then(`${git ? `git init ${name}` : 'sleep 1'}`) // 是否执行 git init
                .run(function (err, next) {
                    // this entire callback is optional.
                    if (err) {
                        // you can ignore the exception
                        // and just call next(), which will
                        // continue the flow
                    } else {
                        if (npm) {
                            const initFile = path.resolve(process.env.HOME, '.npm-init')
                            const dir = `${process.cwd()}/${name}`
                            const configData = { some: 'extra stuff' }
                            // 在指定路径下初始化 package.json
                            init(dir, initFile, configData, function (er, data) {
                                // the data's already been written to {dir}/package.json
                                // now you can do stuff with it
                                // console.log(1111)
                                // console.log(JSON.stringify(err))
                                // console.log(2222)
                                // console.log(JSON.stringify(data))
                            })
                        }
                        console.log('done!')
                    }
                })
            // 模板文件路径
            const templates = [
                '.gitignore',
                'README.md',
                'src/assets/index.js',
                'src/components/index.js',
                'src/pages/index.js',
                'src/router/index.js',
                'src/utils/index.js',
                'index.html'
              ]
          
            templates.forEach(item => {
                // item => 每个文件路径
                this.fs.copyTpl(
                  this.templatePath(item),
                  this.destinationPath(`${name}/${item}`),
                  this.answers
                )
            })
            return
        }
        // 定义选择框架后需要执行的官方 cli map 集合
        const shell = new Map([
            ['Vue', `vue create ${name}`],
            ['React', `create-react-app ${name}`]
        ])
        // 执行框架官方 cli
        new Task(shell.get(framework))
                .run(function (err, next) {
                    // this entire callback is optional.
                    if (err) {
                        // you can ignore the exception
                        // and just call next(), which will
                        // continue the flow
                    } else {
                        console.log('done!')
                    }
                })
    }
  }