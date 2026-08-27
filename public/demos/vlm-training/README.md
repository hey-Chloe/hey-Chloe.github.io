# VLM Training Playground / 静态迁移包

这是从 canonical VLM 研究仓库导出的只读作品集 Demo。运行时不需要 Python、API、登录或模型权重。

## 放入 XIAOYUE 个人网站

个人网站使用 Next.js 静态导出时，将整个 `vlm-training` 目录复制到：

```text
public/demos/vlm-training/
```

然后访问：

```text
/demos/vlm-training/
```

该页面是独立 HTML 文档，不要把 `assets/styles.css` 导入站点全局 Layout。

## 本地预览

建议在此目录上一级启动任意静态服务器，例如：

```bash
python3 -m http.server 8000
```

然后打开 `http://127.0.0.1:8000/vlm-training/`。

## 真实性边界

- source commit: `d4e473ce038a102ae8774376d9937fefb2b4639e`
- J02 / P10 / J10 / C20 状态来自构建时验证通过的仓库 receipts。
- 站内副本将训练标题校准为“远端运行回执已记录、原始产物待同步”；这只是公开叙事边界调整，没有改动研究数据或运行状态。
- 中文问题与选项是 UI 翻译层，不是模型输出，也没有修改 frozen manifest、sample ID、选项顺序或答案标签。
- 本地没有逐样本 prediction artifact 时，页面只显示“模型预测结果等待远端 artifact 同步”。
- 当前没有 COINCIDE 提升或 multi-seed 结论。

## 数据许可

包内 ScienceQA 数据和图片受 CC BY-NC-SA 4.0 约束，仅用于非商业研究与作品集展示。发布前请阅读 `ATTRIBUTION.md`；若个人网站未来具有商业用途，应先重新审查或移除这些数据资产。
