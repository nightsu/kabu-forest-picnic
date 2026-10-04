# 卡布的森林野餐

一个温柔的亲子网页小游戏。装好篮子，发现森林里的朋友，一起分享食物，再留下一张野餐纪念照。

**在线游玩：<https://nightsu.github.io/kabu-forest-picnic/>**

## 玩法

1. **装好篮子**：从六样食物和饮品中选择喜欢的，点一下装入，再点一下取出。
2. **走进森林**：点花丛、池塘和树洞，遇见蝴蝶、青蛙和橡果。探索是可选的，不要求全部找到。
3. **一起野餐**：先点食物，再点小兔、小熊或小松鼠。可以把所有东西给同一位朋友；换一块小毯子，或点太阳让天气变化。
4. **留下回忆**：分享至少一样食物后，可以生成并下载 1800 × 1260 的 PNG 纪念照，也可以回去坐一会儿或重新出发。

没有分数、倒计时、失败惩罚、广告、登录或分析追踪。以点击为主要操作，支持触屏与键盘；尊重系统的“减少动态效果”设置。

## 技术栈

- React + TypeScript（strict、noUncheckedIndexedAccess）
- Vite+：开发、构建、格式化、Oxlint、Vitest
- Motion：按钮反馈、食物进入篮子、角色回应和场景切换
- 原创 React SVG 插画：无需外部图片、字体服务或运行时 AI
- Playwright：实际浏览器中的完整旅程、存储异常、响应式布局与 PNG 导出验收

确切版本以 `package.json` 和 `package-lock.json` 为准。Vite+ 作为项目依赖安装，无需更改全局 Node 或安装全局 `vp`。

## 本地开发

需要 Node.js 24.11+（推荐 Node 24 LTS）和 npm。

```sh
npm ci
npm run dev
```

打开 <http://127.0.0.1:5173>。

```sh
npm run check     # 格式、lint 和 TypeScript
npm test          # 游戏状态与存档规则
npm run build    # 严格类型检查和生产构建，输出 dist/
npm run preview  # 生产构建预览，端口 4174
```

### 浏览器验收

先保持开发服务运行，再在另一个终端执行：

```sh
npx playwright install chromium
npm run test:e2e
```

如果已有 Chrome，可跳过浏览器安装，使用 `BROWSER_CHANNEL=chrome npm run test:e2e`。验收生产构建：`BASE_URL=http://127.0.0.1:4174 npm run test:e2e`。截图和导出的 PNG 保存在被 Git 忽略的 `test-results/`。

## 组件和状态设计

```text
src/
  game/
    model.ts            # 有类型的状态、事件、纯 reducer、存档校验
    content.ts          # 角色名、食物名、章节引导与主题色
  hooks/
    usePicnic.ts        # reducer 与本地存储；不可用时仍可继续玩
    useAudio.ts         # 系统中文朗读与 Web Audio 提示音
  components/
    PicnicScene.tsx     # 交互森林、动物与探索热点
    FoodTray.tsx        # 食物选择、选中和已分享状态
    Progress.tsx        # 旅程进度
    MemoryCard.tsx      # 纪念照预览与导出共用的 SVG
    ParentNote.tsx      # 给家长的说明，原生无障碍对话框
    Illustrations.tsx   # 可复用的动物、食物和物件插画
    Landscape.tsx       # 森林景观
  lib/exportMemory.tsx  # 按需加载的本地 PNG 导出
  App.tsx               # 组装场景、事件反馈和导航
```

游戏规则不依赖 React。组件通过 typed props 和事件回调通信，不在各个组件里重复判断流程规则。SVG 纪念照独立于交互 DOM，因此预览与导出一致，也不会将菜单、按钮截进图片。

添加食物或角色时，先更新模型和内容映射，再加入对应插画与测试。新增玩法应优先扩展 `PicnicAction` 和 reducer，而不是在展示组件中改变进度。

## 部署

构建产物为静态文件，配置 `base: './'`，可以部署在域名根目录或 GitHub Pages 项目子路径。

### GitHub Pages

仓库将源码保留在 `main`，构建产物发布到 `gh-pages`。需要当前 Git 能向 `origin` 推送：

```sh
npm run deploy
```

部署脚本先检查、测试、构建，再在独立临时目录更新 `gh-pages`，不切换工作目录的分支、不强制推送，也不改动源码。第一次部署后，在仓库 **Settings → Pages → Deploy from a branch** 选择 `gh-pages` 分支与 `/ (root)`。后续修改需再次运行部署命令，单独推送 `main` 不会更新在线游戏。

也可以将 `dist/` 整个目录上传至其他静态网站托管平台。不需要服务器、数据库或环境密钥。

## 声音、存储与兼容性

- 点击对话气泡可以重听，声音按钮可以静音。浏览器不允许自动播放时，第一次点击后才会发声。
- 朗读使用设备提供的中文语音，音色和可用性取决于浏览器及系统。系统语音服务可能需要联网；本项目不提供远程语音接口。设备没有中文语音时，仍能通过图形和文字游玩。
- 游戏状态保存在当前浏览器的 `localStorage`，不会跨设备同步。隐私模式、存储被禁用或存档损坏都不会阻止游戏。
- 纪念照在浏览器本地生成，不上传。移动端下载后的保存位置由浏览器决定。
- 核心体验只需要静态资源。当前没有 Service Worker 或离线安装模式。

## 开发参考

- [Vite+ 项目级安装](https://viteplus.dev/guide/local-cli)
- [Motion for React](https://motion.dev/docs/react)

## License

MIT。代码与本项目原创 SVG 插画均可在遵守许可证的前提下使用。
