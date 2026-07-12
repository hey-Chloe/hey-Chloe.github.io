---
title: "Java 数据类型、变量与运算"
date: "2026-07-12"
description: "从数据类型、变量和赋值开始，整理整数除法、类型转换与常见运算规则。"
tags: ["Java", "基础语法"]
---

刚开始学习 Java 时，最先接触到的通常是数据类型、变量和运算符。它们看起来简单，但整数除法、类型转换和字符串拼接很容易在实际写代码时出错。

## 数据类型

数据类型决定程序可以存储和操作哪一类值。

- `boolean`：布尔值，只能是 `true` 或 `false`。
- `int`：整数，例如 `0`、`1`、`-47`。
- `double`：实数或小数，例如 `3.14`、`1.0`、`-2.1`。
- `String`：文本字符串，例如 `"hello"`。

```java
boolean isJanuary = true;
int age = 18;
double badPi = 3.14;
String text = "hello";
```

## 变量与赋值

变量是一个有名字的存储位置，用来保存某一种特定类型的值。

```java
String foo;
foo = "IAP 6.092";
```

声明和赋值也可以写在一起：

```java
String foo = "IAP 6.092";
double badPi = 3.14;
```

变量的值可以改变：

```java
class Hello3 {
    public static void main(String[] arguments) {
        String foo = "IAP 6.092";
        System.out.println(foo);

        foo = "Something else";
        System.out.println(foo);
    }
}
```

## 运算符与运算顺序

常见运算符包括：

- 赋值：`=`
- 加法：`+`
- 减法：`-`
- 乘法：`*`
- 除法：`/`

Java 基本遵循数学中的运算顺序：先括号，再乘除，最后加减。同一优先级通常从左到右计算。

```java
double x = 3 / 2 + 1;
```

这里先进行整数除法，`3 / 2` 得到 `1`，最后结果是 `2.0`。

## 字符串拼接

`+` 不仅可以做加法，也可以连接字符串。

```java
String text = "hello" + " world";
text = text + " number " + 5;
```

最后 `text` 的值是：

```text
hello world number 5
```

## 复合赋值

```java
x += y;
```

等价于：

```java
x = x + y;
```

类似的还有：

```java
x -= y;
x *= y;
x /= y;
```

## 整数除法

除法运算符 `/` 对整数和小数的处理不同。

```java
double a = 5.0 / 2.0; // 2.5
int b = 5 / 2;        // 2
double c = 5 / 2;     // 2.0
```

`double c = 5 / 2;` 并不会得到 `2.5`。右侧先进行整数除法得到 `2`，再转换成 `2.0`。

正确写法：

```java
double c = 5.0 / 2.0;
double d = (double) 5 / 2;
```

## 类型转换

Java 可以自动把 `int` 转换成 `double`：

```java
double number = 2; // 2.0
```

但不能直接把小数放入 `int`：

```java
int number = 18.7; // 编译错误
```

需要显式强制转换：

```java
int number = (int) 18.7; // 18
```

这里是直接舍弃小数部分，不是四舍五入。

字符串和整数之间也可以转换：

```java
String five = Integer.toString(5);
int number = Integer.parseInt("18");
```

如果字符串不是合法整数，`Integer.parseInt()` 会在运行时抛出异常。

## 不要直接比较 double

浮点数计算可能存在微小误差，因此不应该直接用 `==` 判断两个 `double` 是否完全相等。

```java
double a = Math.cos(Math.PI / 2);
double b = 0.0;

if (Math.abs(a - b) < 0.000001) {
    System.out.println("它们近似相等");
}
```

## 本篇小结

数据类型决定变量能保存什么，赋值语句负责把值放进变量。整数除法会舍弃小数部分，类型转换需要留意转换发生的时机。浮点数比较则更适合使用误差范围，而不是直接使用 `==`。
