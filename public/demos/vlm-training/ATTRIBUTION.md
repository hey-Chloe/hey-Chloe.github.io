# ScienceQA 数据归因与修改说明

本 Demo 展示的 128 个图文问答样本来自 ScienceQA。

- 上游项目：lupantech/ScienceQA
- 上游 revision：`2cbf8318e07b9ece895bb2ae605e71e38d623264`
- 数据镜像：`derek-thomas/ScienceQA`
- 冻结镜像 revision：`f18b0a70359ebfb41f658fd564208d0355b013f4`
- 数据许可：CC-BY-NC-SA-4.0
- 许可原文：https://github.com/lupantech/ScienceQA/blob/2cbf8318e07b9ece895bb2ae605e71e38d623264/LICENSE-DATA
- 使用边界：non-commercial research only

修改说明：本项目从冻结的 ScienceQA train split 中选择 128 个样本用于非商业研究演示；图片与英文原题保留，另增简体中文 UI 翻译层。中文翻译不是模型输出，不改变 sample ID、选项顺序、Ground Truth label 或研究输入。

Qwen2.5-VL 模型权重、LoRA checkpoint 和任何 secrets 均不包含在本静态包中。
