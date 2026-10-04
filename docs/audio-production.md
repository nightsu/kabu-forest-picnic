# 配音生成与发布

游戏通过 `src/game/voiceLines.json` 将界面消息映射到固定 MP3。食物操作的朗读比界面文字短，避免每次点击重复长提示。`VoicePlayer` 只播放最近一次交互，同一句播放中不会重新开始，结束后可点击重听。未知错误保持文字提示。

选用百炼北京地域 `qwen3-tts-instruct-flash-2026-01-26` 的 Cherry 系统音色，指令采用自然、温暖的成年女性绘本讲述方式。生成后使用 ffmpeg 统一音量为约 -19 LUFS、峰值 -2 dB，输出单声道 MP3。最终效果需要试听判断。

## 生成

1. 在百炼北京地域准备 API Key，并为**这个确切模型**开启、确认“免费额度用完即停”。脚本不会替你调整云端设置。
2. 只在本机配置 `DASHSCOPE_API_KEY` 和 `DASHSCOPE_FREE_TIER_ONLY_CONFIRMED=1`。不要使用 `VITE_` 前缀，不要将密钥写入源文件、日志或 Git。
3. 安装 ffmpeg，执行 `npm run audio:plan` 查看字符数；预演不会请求 API。
4. 执行 `npm run audio:generate -- --only=chapter-0,discover-frog,share-rabbit-apple` 制作试听，确认音色和“卡布”的读音，再生成其余文件。
5. 执行 `npm run audio:generate`。默认跳过已有文件，每批上限 1000 字符；遇到接口错误立即停止，无付费回退，无自动重试。不要把 `DASHSCOPE_FREE_TIER_ONLY_CONFIRMED=1` 误认为服务端保障：只有百炼控制台的额度用完即停设置能限制计费。

临时 WAV 会自动删除，永久音频位于 `public/audio/`。服务返回的音频链接会过期，因此必须保存文件，不能把临时 URL 放到游戏里。生成信息写入 `public/audio/credits.json`，不包含密钥。

## 检查与部署

`npm run audio:check` 校验所有配音文件及 MP3 头。`npm run build` 和 `npm run deploy` 会先执行这个检查，配音缺失时不会发布一个静音的版本。

播放时仅从网站自己的 `audio/` 路径加载音频，不请求百炼，不含运行时 API Key。部署后的游玩不会消耗合成额度。首次声音由点击触发，静音立即终止播放；加载失败也不影响游戏操作。

新增或修改台词时，必须同步清单并重新生成对应文件。更换声音风格时应先备份旧音频，再有选择地重新生成；不要批量重试造成额外消耗。

官方参数：[Qwen-TTS API](https://help.aliyun.com/zh/model-studio/qwen-tts-api)。
