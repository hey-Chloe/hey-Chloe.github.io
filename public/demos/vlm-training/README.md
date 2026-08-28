# VLM Training Playground / 静态迁移包

这是从 canonical VLM 研究仓库导出的只读作品集 Demo。运行时不需要 Python、API、登录或模型权重。

入口现在是一组中文三轮互动实验：访客先选择 1K 数据预算的优先级，再竞猜两个真实样本集合的结果，最后用证据排除错误解释。选择只控制页面反馈，不会生成或改写实验分数。

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

- source commit: `91035879bc6dbfd4a1baa32aa3b7c1124f5f4bfb`
- J02 / P10、六个 1K run、Base 与失败分析状态来自构建时验证通过的本地 artifacts。
- 中文问题与选项是 UI 翻译层，不是模型输出，也没有修改 frozen manifest、sample ID、选项顺序或答案标签。
- 页面包含 J02 已回收的真实逐样本 LoRA prediction；没有同样本 Base 输出，因此不构造 Before / After。
- 三 seed 真实结果为 Random-1000 高于 faithful COINCIDE-1000；这是负结果，不包装成提升。
- COINCIDE 并非因重复更多而失败：它覆盖更多长尾技能，并把近重复率从 66.0% 降至 52.3%。
- 当前证据支持继续检查 1K 小预算的科目再分配，以及 TinyLLaVA 选择表征到下游 Qwen 指标的迁移/目标错配；这些仍是解释假设，不是已经证明的因果。
- 只有 3 个随机种子，准确率的 95% 置信区间跨过 0；页面不把当前负结果外推为“COINCIDE 普遍无效”。

## 数据许可

包内 ScienceQA 数据和图片受 CC BY-NC-SA 4.0 约束，仅用于非商业研究与作品集展示。发布前请阅读 `ATTRIBUTION.md`；若个人网站未来具有商业用途，应先重新审查或移除这些数据资产。
