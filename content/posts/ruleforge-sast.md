---
title: RuleForge-SAST实践
date: 2026-07-29
description: 基于Semgrep的SAST工具实践
---

# RuleForge-SAST：基于 Semgrep 的轻量级 SAST 漏洞检测工具实践

## 一、项目背景

随着软件规模不断扩大，人工代码审计成本越来越高。

传统人工审计流程：

```text
开发代码
   |
   ↓
安全人员人工阅读
   |
   ↓
发现漏洞
   |
   ↓
修复验证
```

存在问题：

- 效率低
- 容易遗漏
- 难以持续检测

因此，希望实现一个简单的 SAST 工具，通过安全规则自动发现代码中的安全问题，并验证漏洞修复效果。

---

# 二、什么是 SAST？

SAST（Static Application Security Testing）

中文：

> 静态应用安全测试

SAST 的特点：

- 不运行程序
- 直接分析源码
- 根据安全规则发现漏洞

基本流程：

```text
源码
 |
 ↓
规则匹配
 |
 ↓
漏洞报告
 |
 ↓
修复验证
```

常见工具：

- Semgrep
- SonarQube
- CodeQL

---

# 三、项目介绍

## 项目名称

RuleForge-SAST


## 项目简介

一个基于 Semgrep 的轻量级静态代码安全检测工具。

实现：

- 漏洞规则检测
- 代码差异分析
- Patch 修复验证


## 当前实现功能

- ✅ 自定义漏洞检测规则
- ✅ Semgrep 扫描封装
- ✅ Git Diff 分析
- ✅ Patch 修复验证

---

# 四、项目整体架构

整体流程：

```text
             用户代码

                |
                ↓

          RuleForge-SAST

                |
       -----------------

       |               |

    规则引擎        Diff分析

       |               |

       ↓               ↓

    Semgrep        Git Patch

       |
       ↓

    漏洞结果
```

---

# 五、核心功能实现

## 1. 自定义漏洞规则

例如 PHP 反序列化漏洞：

危险代码：

```php
<?php

unserialize($_GET["cmd"]);

?>
```

Semgrep 规则：

```yaml
rules:
  - id: php-dangerous-unserialize
    languages:
      - php
    message: Dangerous unserialize usage
    severity: ERROR
```

执行检测：

```bash
semgrep scan \
--config rules/php-unserialize.yaml \
target
```

检测结果：

```text
test.php

Dangerous unserialize usage
```

---

## 2. 规则优化

初始规则：

检测：

```php
unserialize($x)
```

但是存在误报。

例如安全写法：

```php
unserialize(
    $data,
    [
        "allowed_classes"=>false
    ]
);
```

因此增加：

```text
pattern-not
```

排除安全情况。

效果：

> 降低安全扫描误报。

---

## 3. Git Diff 分析

## 为什么需要 Diff？

真实开发环境中：

不是每天扫描整个项目。

通常流程：

```text
提交代码

↓

查看修改部分

↓

检测新增风险
```

通过 GitPython 获取代码变化：

```python
repo.git.diff(
    old_commit,
    new_commit
)
```

输出示例：

修改前：

```diff
- unserialize($_GET["cmd"]);
```

修改后：

```diff
+ unserialize(
+ $_GET["cmd"],
+ ["allowed_classes"=>false]
+ )
```

---

## 4. Patch 修复验证

目标：

判断漏洞是否真正修复。


流程：

```text
漏洞版本

↓

Semgrep扫描

↓

修改代码

↓

再次扫描

↓

比较结果
```


示例：

修复前：

```text
Finding: 1
```

修复后：

```text
Finding: 0
```


输出：

```text
FIXED
```

---

# 六、项目运行

## 环境

- Python
- Semgrep
- GitPython


## 安装依赖

```bash
pip install -r requirements.txt
```


## 执行扫描

```bash
semgrep scan \
--config rules/php-unserialize.yaml \
target
```

---

# 七、项目收获

通过该项目学习：

- SAST 工具设计
- Semgrep 规则编写
- PHP 漏洞检测
- Git Diff 机制
- 自动化安全验证


同时理解：

> 漏洞检测不仅是发现问题，更重要的是验证修复是否真正有效。

---

# 八、未来规划

## 增加更多漏洞规则

计划支持：

- SQL 注入
- 文件上传
- 命令执行
- SSRF


## 增加 Web 管理界面

实现：

- 在线代码扫描
- 漏洞结果展示
- 修复验证


## 增加 AI 辅助分析

结合大语言模型：

实现：

- 漏洞原因分析
- 修复建议生成
- 安全规则辅助生成


## 支持更多语言

未来支持：

- Java
- Python
- JavaScript 等语言
