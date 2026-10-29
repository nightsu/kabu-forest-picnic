# 探索伙伴动作细化

目标是补足实际的肢体变化，同时保留原来的角色外观、探索轨迹、重复点击和减少动态效果支持。小兔、小熊、小松鼠的完整动作继续保留。

## 素材与体积

使用内置 imagegen 工具，分别以现有蝴蝶和青蛙的裁切图为参考，制作了两个透明 PNG：

- `art/generated/butterfly-parts-v1.png`：原始生成图，2172 × 724，三列分别是左翅、身体与触角、右翅。
- `art/generated/frog-motion-v1.png`：原始生成图，1536 × 1024，四个完整姿势。交付时使用其中的蓄力、腾空、落地姿势，原位仍使用已有青蛙。

生成图保留归档。用 Sharp 将宽高各缩到一半，作为 `art/source/` 下的同名 PNG 交付源文件；`art/recipe.json` 中的 motion 分组记录对应的裁切区域。原始四宫格不是严格无缝网格，裁切区域避开了相邻姿势的像素，不直接取四个完整等分格。

构建产物 `motion.webp` 为 157,846 字节，首次发现蝴蝶或青蛙后才请求。全部六张交付图片合计 1,671,196 字节，相比原始项目的 2,034,420 字节仍少约 17.9%。相对于上一轮纯图集整理的 1,513,350 字节，增加约 158 KB。此处比较的是文件体积，不是首屏下载量。`build-art` 的压缩比例以当前全部交付源文件为分母，不能与旧版本直接横向比较。

## 动作

蝴蝶的两个翅膀包含完整的上下翅、绒毛、针脚、斑点与叶脉，分别绕身体边缘扑动；身体和触角保持形状。翅膀根部的隐藏区域真实存在，并由身体覆盖。两翼以略有差别的幅度扑动，沿用 2.8 秒的原飞行轨迹，落回后保持完整展开。

青蛙用完整姿势替换原先的大幅整图压缩。1.4 秒跳跃过程中只显示一个姿势：

| 时间比例 | 姿势     |
| -------- | -------- |
| 0–8%     | 原位     |
| 8–21%    | 蓄力     |
| 21–66%   | 伸腿腾空 |
| 66–84%   | 弯腿落地 |
| 84–94%   | 收腿缓冲 |
| 94–100%  | 回到原位 |

保留原来的横向位移、跳跃高度、影子、水波及点击重播。腾空时允许腿部超出原位的局部画框，头部尺寸与脚底锚点经过对齐；需在窄屏实际检查脚趾不会被场景边缘切掉。

`DiscoveryFriend` 先解码新图集，再启动动作，避免首次加载时出现空白姿势。解码失败时用原图继续飞行或跳跃。系统选择减少动态效果时，轨迹与扑翅关闭，青蛙只显示原位。

`ButterflyArt()` 与 `FrogArt()` 的默认形式仍为原始静态形象，用于纪念照；不会把多个动画姿势叠加导出。

## 查看与验证

运行 `npm run dev` 后打开 `/examples/discovery.html`，比较原动作与新动作。青蛙还可单独选择蓄力、腾空和落地，便于检查四肢、尺寸和接缝。此页面不进入生产构建。

```sh
npm run check
npm test
npm run build
BROWSER_CHANNEL=chrome BASE_URL=http://127.0.0.1:4174 npm run test:e2e
BROWSER_CHANNEL=chrome BASE_URL=http://127.0.0.1:4174 npm run test:discovery
```

## 图像生成提示词

工具：内置 `image_gen.imagegen`，`transparent_background: true`。参考图来自原始 `small.webp` 中的蝴蝶、青蛙，生成前均进行了视觉检查。

### 蝴蝶部件

Produce genuine separate animation parts for the exact golden yellow felt butterfly in the reference. Preserve stitched golden wings, cream circular spots on each upper and lower wing, brown embroidered veins, fuzzy wool, dark brown segmented body, and two rounded antennae. No eyes or face added. Three equal transparent cells: complete left wing, body with antennae, complete right wing. Each wing includes both lobes and a fully painted root for overlap behind the body. Paint covered areas completely so moving parts cannot reveal missing pixels. No assembled butterflies repeated across cells, no labels, background, shadow, or other objects. Same handmade plush material and lighting as reference. Intended coordinate layout: 1536 × 512 with 512-square cells, wing hinge near x=256,y=260 within a shared local frame. The actual output size/layout was inspected and explicitly aligned in code rather than assuming the requested grid coordinates were followed.

### 青蛙姿势

Create four complete full-body poses for the existing green plush frog: relaxed idle, lowered crouch with tucked hind legs, airborne with both hind legs visibly extended and front paws reaching, soft landing with widely planted feet and bending knees. Preserve olive green wool felt, large cream/brown eyes with white highlights, embroidered curved smile, pink cheeks, cream oval belly, stitches and padded toy volume. Actual limbs must change; do not merely squash or stretch one picture. Four poses in a 1536 × 1024 two-by-two transparent grid, one per 768 × 512 cell. Same frontal view, head size, torso volume and facial identity. Center each torso at local x=384; grounded feet baseline near y=440, extended feet stay inside y=470. Generous transparent gutters, no cropped toes, floor, drop shadows, props, words, or motion streaks.
