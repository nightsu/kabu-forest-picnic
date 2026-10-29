# 卡布的森林野餐

一个温柔的亲子网页小游戏。装好篮子，发现森林里的朋友，一起分享食物，再留下一张野餐纪念照。

**在线游玩：<https://nightsu.github.io/kabu-forest-picnic/>**

## 玩法

1. **装好篮子**：从六样食物和饮品中选择喜欢的，点一下装入，再点一下取出。
2. **走进森林**：点花丛、池塘和树洞，遇见蝴蝶、青蛙和橡果。蝴蝶的双翅独立扑动，沿大弧线飞回；青蛙先蹲下蓄力，伸开后腿跃起，落回荷叶时弯腿缓冲；橡果从树洞滚出、轻弹落地。再次点击可以重播。探索是可选的，不要求全部找到。
3. **一起野餐**：先点食物，再点小兔、小熊或小松鼠。朋友们会闭眼、抬起双手吃东西；不选食物时，小兔挥手、小熊张开双臂、松鼠摆尾招呼，可以反复点击。发现的蝴蝶和青蛙会来到野餐地，橡果可以送给松鼠。可以把所有食物给同一位朋友，或点太阳让天气变化。
4. **留下回忆**：分享至少一样食物后，可以生成并下载 1800 × 1260 的 PNG 纪念照，照片也会留下探索中遇见的伙伴和橡果。可以回去坐一会儿或重新出发。

没有分数、倒计时、失败惩罚、广告、登录或分析追踪。以点击为主要操作，支持触屏与键盘；尊重系统的“减少动态效果”设置。

面向尚未识字的孩子：旅程用篮子、森林、野餐和照片表示，前进与返回使用大块箭头加目的地图画按钮；食物和探索伙伴以图画呈现，操作提示由固定中文配音引导。文字名称保留给屏幕阅读器，家长说明单独放在“小纸条”中。

## 技术栈

- React + TypeScript（strict、noUncheckedIndexedAccess）
- Vite+：开发、构建、格式化、Oxlint、Vitest
- Motion：按钮反馈、食物进入篮子、角色回应和场景切换
- 毛绒玩偶与不织布场景：本地 WebP 素材、SVG 图层组合、角色姿势帧；无需外部图片服务或运行时 AI
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
npm test          # 游戏状态、存档与音频播放规则
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

使用 `BROWSER_CHANNEL=chrome node tests/discovery-browser.mjs` 测量探索伙伴的实际移动范围，并检查手机边缘裁切、重复点击、野餐阶段和减少动态效果设置。

## 组件和状态设计

```text
src/
  game/
    model.ts            # 有类型的状态、事件、纯 reducer、存档校验
    content.ts          # 角色名、食物名、章节引导与主题色
    voiceLines.json     # 固定配音清单：界面消息、短朗读和音频 ID
  hooks/
    usePicnic.ts        # reducer 与本地存储；不可用时仍可继续玩
    useAudio.ts         # 固定 MP3 配音与 Web Audio 提示音
  components/
    PicnicScene.tsx     # 交互森林、动物与探索热点
    FoodTray.tsx        # 食物选择、选中和已分享状态
    Progress.tsx        # 旅程进度
    MemoryCard.tsx      # 纪念照预览与导出共用的 SVG
    ParentNote.tsx      # 给家长的说明，原生无障碍对话框
    Illustrations.tsx   # 可复用的动物、食物和物件插画
    PlushArt.tsx        # 毛绒素材裁切、姿势播放与计时器清理
    Landscape.tsx       # 森林景观
  lib/VoicePlayer.ts    # 单通道录音播放、打断、重听和错误处理
  lib/exportMemory.tsx  # 按需加载的本地 PNG 导出
  App.tsx               # 组装场景、事件反馈和导航
```

游戏规则不依赖 React。组件通过 typed props 和事件回调通信，不在各个组件里重复判断流程规则。SVG 纪念照独立于交互 DOM，因此预览与导出一致，也不会将菜单、按钮截进图片。

美术源文件位于 `art/source/`，裁切配方位于 `art/recipe.json`，生成提示词见 [素材说明](docs/design/plush-art.md)。`npm run art:build` 自动清除未使用区域、裁掉透明边距并重新打包，生成 `src/assets/plush/` 的 WebP 和带类型的坐标清单；开发、检查、测试和构建都会自动执行。生成文件不提交，也不需要手改裁切坐标。角色使用独立的手臂和表情姿势帧，点击后播放有限序列并回到原位；减少动态效果时只短暂显示一个回应姿势。纪念照导出会先将素材内嵌进 SVG，每张图集只嵌入一次。

天气入口位于上方天空，手机上也有独立的大触摸区域。每只动物面前的小餐盘会保留实际分享的食物，水壶摆在盘边，不使用数量徽章；赠送的橡果也会放进松鼠餐盘。纪念照保持相同的食物和橡果归属。小松鼠使用银灰毛色与淡紫领巾，和暖棕色的小熊区分。

添加食物或角色时，先更新模型和内容映射，再加入对应插画与测试。新增玩法应优先扩展 `PicnicAction` 和 reducer，而不是在展示组件中改变进度。

可用 `npm run test:audio` 验收真实 MP3 播放、打断、静音持久化和音频下载失败后的可玩性。默认验收 `http://127.0.0.1:4174`，支持 `BASE_URL` 覆盖。

## 部署

构建产物为静态文件，配置 `base: './'`，可以部署在域名根目录或 GitHub Pages 项目子路径。

### GitHub Actions 自动发布（推荐）

`.github/workflows/pages.yml` 会在 PR 和推送 `main` 后执行格式、lint、类型、单元测试、生产构建、完整浏览器流程与真实配音验收。只有 `main` 的全部检查通过，才把同一份 `dist/` 作为 artifact 发布到 GitHub Pages；PR 只检查。

首次启用需要在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。之后推送 `main` 即可自动更新，不再维护 `gh-pages` 构建产物分支。仅添加本地工作流文件不会改变仓库设置或立即上线。

### 本机发布到 gh-pages（兼容旧方式）

如果仓库仍使用 **Deploy from a branch → gh-pages**，可以继续运行旧脚本。需要当前 Git 能向 `origin` 推送：

```sh
npm run deploy
```

部署脚本先检查、测试、构建，再在独立临时目录更新 `gh-pages`，不切换工作目录的分支、不强制推送，也不改动源码。第一次部署后，在仓库 **Settings → Pages → Deploy from a branch** 选择 `gh-pages` 分支与 `/ (root)`。使用旧方式时，后续修改需再次运行部署命令，单独推送 `main` 不会更新在线游戏。切换到 GitHub Actions 后，请使用自动发布流程。

也可以将 `dist/` 整个目录上传至其他静态网站托管平台。不需要服务器、数据库或环境密钥。图片和配音通过 Vite 导入并生成带内容哈希的地址；配音仍按播放需要下载，不会因导入地址而全量预加载。`public/_headers` 提供 Cloudflare Pages 的缓存规则：哈希资源长期缓存，HTML 重新验证。GitHub Pages 的响应缓存时间由平台管理，不读取此文件。

## 声音、存储与兼容性

- 点击对话气泡可以重听，声音按钮可以静音。浏览器不允许自动播放时，第一次点击后才会发声。
- 使用千问生成的固定中文 MP3，随游戏一起部署，音色不依赖设备的系统语音。游玩不请求百炼接口，不消耗合成额度。快速点击会切换到最新一句，声音加载失败时仍可通过图形和文字游玩。
- 配音共 60 段，生成方式、免费额度保护与复用方法见 [配音生产说明](docs/audio-production.md)。密钥仅在本机生成时使用，不进入前端或仓库。
- 游戏状态保存在当前浏览器的 `localStorage`，不会跨设备同步。隐私模式、存储被禁用或存档损坏都不会阻止游戏。
- 纪念照在浏览器本地生成，不上传。移动端下载后的保存位置由浏览器决定。
- 核心体验只需要静态资源。当前没有 Service Worker 或离线安装模式。

## 开发参考

- [Vite+ 项目级安装](https://viteplus.dev/guide/local-cli)
- [Motion for React](https://motion.dev/docs/react)

## License

MIT。毛绒素材由图像生成工具制作，生成说明随项目保存。

## 人物动作与素材优化对比

运行 `npm run dev`，打开 <http://127.0.0.1:5173/examples/motion.html>。左侧使用原始图集，右侧使用重新打包后的图集，两边同步播放完整挥手和吃东西动作。该页面不进入生产构建。

保留原有四个完整姿势、表情和播放节奏。已撤回静态角色遮罩加尾巴旋转的实验：它缺少手臂与表情回应，不能作为现有动画的替代。当前优化集中于去除重复素材、透明边距和构建发布；未来要做局部动画，应先制作有完整遮挡补画的独立部件，再以动作表现验收。

蝴蝶和青蛙的细化对比位于 <http://127.0.0.1:5173/examples/discovery.html>，左侧保留原动作，右侧可查看独立扑翅与完整跳跃姿势。新素材、坐标、体积和生成提示词见 [探索伙伴动作说明](docs/design/discovery-motion.md)。新图集加载失败时仍可使用原图游玩，纪念照继续使用原始静态形象。
