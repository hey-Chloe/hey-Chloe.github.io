# KAI Market Lab 公开作品集版

这是一个零依赖、可直接迁移到个人网站的静态页面。界面使用中文优先的明亮作品集风格。

## 本地预览

在本目录运行：

```bash
python3 -m http.server 4173
```

然后访问 `http://localhost:4173/`。

## 放入个人网站

### 方案一：作为独立案例页

把整个 `kai-market-lab-public` 文件夹复制到个人网站的静态资源目录，例如：

```text
public/projects/kai-market-lab/
```

访问路径通常是：

```text
/projects/kai-market-lab/index.html
```

### 方案二：嵌入已有项目详情页

```html
<iframe
  src="/projects/kai-market-lab/index.html"
  title="KAI Market Lab"
  loading="lazy"
  style="width:100%;min-height:900px;border:0"
></iframe>
```

如果个人网站使用严格的内容安全策略，请允许同源的 CSS、JavaScript 和 JSON 请求。

## 公开边界

该版本只读取 `data/public_v2_summary.json`，并要求：

- `result_scope = PUBLIC_AGGREGATE_ONLY`
- `source_scope = STATIC_NO_MODEL_DEMO`
- 所有模型指标保持 `null`

逐样本回放、订单簿数据、预测概率、策略序列、模型权重和私有路径均未包含。页面中的订单簿图仅为结构示意，不是历史数据，也不执行模型推理。
