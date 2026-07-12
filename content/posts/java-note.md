---
title: "Java 基础学习笔记"
date: "2026-07-08"
description: "记录 Java 基础语法、类、对象和方法的学习过程。"
tags: ["Java", "CS"]
---

## 为什么先学 Java 基础

最近重新整理 Java 基础，发现很多看起来简单的知识点，如果没有真正写过代码，很容易停留在“好像懂了”的状态。比如变量、方法、类和对象，单独看概念并不难，但一到自己组织代码时，就会发现命名、职责划分和调用关系都需要练习。

## 基础语法

Java 程序的基本结构比较固定。入口方法通常是：

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Java");
    }
}
```

目前我会重点关注这几件事：

1. 变量类型是否清楚，比如 `int`、`double`、`boolean`、`String`。
2. 分支和循环能不能写顺手。
3. 方法参数、返回值和调用关系是否理解。
4. 遇到报错时先读错误信息，而不是直接复制搜索。

## 类和对象

面向对象暂时先不用追求设计模式，先把最基础的概念写熟：类是对一类事物的描述，对象是具体实例。比如可以先写一个 `Student` 类，包含姓名、年龄和学习方法。

```java
class Student {
    String name;
    int age;

    void study(String subject) {
        System.out.println(name + " is studying " + subject);
    }
}
```

我现在的理解是：学习面向对象不能只背“封装、继承、多态”，而是要通过代码理解“数据和行为为什么要放在一起”。

## 下一步

后面准备继续整理集合、异常处理、文件读写和简单项目练习。每学完一块，都尽量写一个小例子，不让笔记只停留在概念层面。
