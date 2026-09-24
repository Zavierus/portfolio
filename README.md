# 王泽源 / ZIAVER 内容产品与创意技术作品集

一个围绕内容产品、摄影、视觉与实时互动展开的个人作品集。真实业务结果建立职业背景，独立互动项目记录从问题定义到交付验证的完整过程。

作者：王泽源 / Ziaver  
联系：939431931@qq.com

## 已完成

### FRAME//ZERO

路径：`projects/frame-zero/index.html`

原创全屏 3D 时间射击切片。核心机制是玩家移动和转向时世界时间加速，停止行动时敌人、子弹与物理碎片近乎凝固。

功能包括：

- 第一人称键鼠控制
- 六发手枪、五段换弹动画和武器投掷
- 四个连续战区、十名敌人与预测射击
- 物理碎裂、玻璃破坏、命中分区和原创分层音效
- 波次检查点、动态分辨率与桌面/移动端适配
- 通关时间、命中率和连击统计

技术：Three.js、cannon-es、Web Audio API、esbuild。

46 项自动测试覆盖换弹时间轴、音频反馈、可暂停任务、玩家碰撞、子弹遮挡、远端弹道边界、检查点和波次配置。

### PULSE ROOM

路径：`projects/pulse-room/index.html`

真实音频驱动的全屏 3D 动效播放器。可导入多首本地音乐并管理播放队列，内置一首运行时生成的原创 WAV 示例曲，因此无需外部素材即可直接体验。

功能包括：

- 播放、暂停、上一首、下一首、拖动进度、音量与单曲循环
- 本地多文件导入、拖放导入和队列切换
- Web Audio FFT 频谱与波形分析
- Aperture、Ribbon、Grid 三种实时 3D 视觉模式
- 桌面端信息轨与移动端队列抽屉
- 自适应像素比和移动端粒子预算

技术：Three.js、Web Audio API、WebGL、esbuild。

### THE LISTENER / 倾听者

路径：`projects/echo-hall/index.html`

一段约 95 秒、仅需点击播放的实时 3D 概念短片。公开目录继续保留 `projects/echo-hall/`，避免已有项目链接失效。

短片设定：一件携带人类最后档案的非对称遗物抵达未知宇宙巨构。巨构从残缺问候中读取光、物质与记忆，发现地球早已沉寂，并开始重建第一具人类身体。

已完成：

- 问候、尺度误读、苏醒、辨认、灭绝与重建六幕叙事已锁定
- 非人形主角、巨构材料与确定性镜头设计已完成
- 三类人类记忆、死寂地球和人体点云重构均由实时着色器驱动
- 一次播放、自动隐藏控制、四层叙事音频与非循环结尾已落地

技术：Three.js、Web Audio API、GLSL、postprocessing、esbuild。

主站与三项作品均有自动化回归测试：

```powershell
npm.cmd test
```

## 构建

```powershell
npm.cmd install
npm.cmd run build
```

构建后可以直接打开 `index.html`，或运行：

```powershell
python -m http.server 4173
```

然后访问 `http://localhost:4173`。

## 部署准备

当前站点是纯静态文件，适合 GitHub Pages、Vercel 或静态站点托管。发布目录为仓库根目录，入口是 `index.html`。

公开部署前仍需完成两件事：

1. 将字节跳动经历结束时间修正为 `2025.09`，生成新版 PDF 简历。
2. 确认使用个人 GitHub/Vercel 账号或 Codex Sites 后再执行公开部署。

历史 HotDrop 原型和过程截图保存在本地 `archive/`，不进入公开版本。
