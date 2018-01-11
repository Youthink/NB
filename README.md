# 网咖计时系统

> 桌面应用

## 技术栈

* Electron
* react
* ECMAScript 6
* webpack
* Less

# 开发

首次安装依赖
```
ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron yarn install
```

安装依赖
```
yarn install
```

webpack 打包监听文件改动
```
yarn build
```

启动应用
```
yarn start
```

## TODO

- bugfix 有时候自动刷新数据全都不展示了
- 单价不能为零 不能为空
- 更新后的总金额不能为空
- 更新的时候可以修改单价
- 添加的时候必须有机器号、金额不能为零、字段不能为空
