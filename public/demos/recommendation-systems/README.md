# 推荐算法互动实验室 · 可迁移版

这是一个完全自包含的静态页面：没有登录、接口密钥、外部接口、字体下载或网络依赖。
页面中的技术指标来自随包附带的公开离线实验记录，不代表生产效果。首屏 Top-3 排位赛的人物、候选、参考顺序、命中与排位反馈均为确定性的教学模拟，不是模型输出或真实 benchmark。

首屏可以直接完成：

- 阅读一位模拟用户的明确偏好；
- 从六件候选商品中选择并调整 Top-3；
- 查看命中、顺序与逐项原因；
- 切换三轮不同模拟用户；
- 继续检查召回、CTR、位置偏差与离线评估证据。

## 本地预览

在本目录的上一级运行：

```bash
python3 -m http.server 4191
```

打开：

```text
http://127.0.0.1:4191/recommendation-systems-playground-portable/
```

不能直接双击 `index.html`，因为浏览器会阻止本地文件读取 JSON；必须通过本地静态服务器或网站访问。

## 放入 XIAOYUE 个人网站

个人网站使用 Next.js 静态导出。推荐把整个目录复制到：

```text
public/demos/recommendation-systems/
```

构建后可直接访问：

```text
/demos/recommendation-systems/index.html
```

这种方式不会让实验页的 CSS 影响个人网站，也不会让个人网站的全局 CSS 破坏实验页。

如果需要从 LAB 页面进入，只需增加一个普通链接：

```tsx
<a href="/demos/recommendation-systems/index.html">
  打开推荐算法互动实验室
</a>
```

如果希望保留个人网站导航，可在站内页面使用 iframe：

```tsx
<iframe
  src="/demos/recommendation-systems/index.html"
  title="推荐算法互动实验室"
  style={{ width: "100%", minHeight: "100svh", border: 0 }}
/>
```

直接链接更稳定，也更适合招聘会全屏演示；iframe 更适合维持站内导航。

## 目录说明

```text
index.html       页面结构
styles.css       独立视觉样式
app.js           只读互动逻辑
ranking-game-core.js  排名调整与教学评分纯函数
data/            合成交互样例与公开离线实验记录
tests/           排位赛 Fixture、评分与移动边界测试
MANIFEST.json    文件哈希与真实性边界
ATTRIBUTION.md   数据来源、许可、引用与站内修改说明
```

## 自测

```bash
node --check app.js
node --test tests/ranking-game.test.cjs
```

## 不得误述的边界

- 这是公开离线数据演示，不是生产推荐系统上线证据。
- Top-3 排位赛不是模型评测；人物、候选、参考顺序和得分都只用于教学模拟。
- 站内公开副本已将 Amazon 用户级回放替换为明确标注的合成浏览历史和概念推荐，不再暴露弱假名化的用户或商品别名。
- 概率校准分组均值不是单个用户的真实线上点击率。
- 没有用户级模型检查点的算法不会生成伪造推荐列表。
- 数据包不会写入 KAI Production、Data Flywheel 或个人网站分析数据。
