# 极客时间文档

使用 Astro 静态展示仓库中的极客时间 Markdown。文章保持原有的“分类 / 课程 / 文档”目录结构；每个课程的 `mkdocs.yml` 仅用于保留原始文章顺序。

## 本地开发

需要 Node.js 22 或更高版本。

```shell
npm install
npm run dev
```

开发服务器启动后访问终端显示的地址。生产构建：

```shell
npm run build
npm run preview
```

## Docker 部署

先在本机生成静态 HTML，再构建只包含 Nginx 和静态文件的镜像。这避免 Docker 构建时的 Node.js 内存压力：

```shell
sh scripts/build-static.sh
docker build -t geektime-docs .
docker run -d --restart always --name geektime-docs -p 8091:8091 geektime-docs
```

浏览器访问 <http://127.0.0.1:8091/>。

## 内容约定

- 顶层目录是分类，第二层目录是课程，课程内 `docs/*.md` 是文章。
- 文章首个一级标题用作页面标题；没有一级标题时使用文件名。
- 文章目录展示二级、三级标题；代码块会使用 Astro 内置 Shiki 高亮。
- Markdown 文档均由 [my-geektime](https://github.com/zkep/my-geektime) 生成。

## 格式化 Markdown

格式化全部已跟踪的 Markdown 文档；脚本会保留文首水平分隔线，避免被误识别为 Astro frontmatter：

```shell
npm run format:markdown
```
