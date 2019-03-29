# wi framework
`wi v1.0.0`
```
Release notes:
1. 增加组件系统
```

# 目录结构
## bootstrap
所有跟打包有关的都放这个目录（Webpack配置，自定义loader，自定义plugin）

## config
只有环境配置

## dist
打包结果，最终部署以此目录为准

## local
本地调试使用的目录，与部署的区分开，便于提交部署代码

## src
所有的源码

### src/apis
所有接口相关，接口文件

### src/assets
所有公用的图片这类资源

### src/config
业务配置，一般是根据业务变化，会动态变的

### src/core
框架核心代码

#### src/core/focus-graph.js
焦点切换，两个焦点切换时间在个位毫秒级内切换。

### src/pages
所有页面