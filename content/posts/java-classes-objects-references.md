---
title: "Java 类、对象与引用"
date: "2026-07-10"
description: "理解类与实例、字段和方法，以及基本类型与引用类型之间的区别。"
tags: ["Java", "面向对象"]
---

学习面向对象时，最容易混淆的不是语法，而是“变量里到底保存了什么”。基本类型变量直接保存值，而对象变量保存的是引用。

## 类与实例

类是创建对象的模板，用来规定对象具有哪些字段和方法。

```java
public class Baby {
    String name;
    boolean isMale;
    double weight;
    int numPoops;
}
```

实例是根据类实际创建出来的对象：

```java
Baby shiloh = new Baby();
Baby knox = new Baby();
```

这里：

- `Baby` 是变量的数据类型；
- `shiloh`、`knox` 是变量名；
- `new Baby()` 创建新的对象；
- 两次 `new` 创建的是两个独立实例。

## 访问字段与调用方法

访问字段使用点号：

```java
System.out.println(shiloh.name);
shiloh.numPoops = 3;
```

调用对象方法同样使用点号：

```java
shiloh.sayHi();
shiloh.eat(1);
```

## 基本类型与引用类型

基本类型变量直接保存实际的值：

```java
int age = 18;
double weight = 60.5;
boolean isMale = true;
```

对象、数组和 `String` 属于引用类型：

```java
Baby baby = new Baby();
int[] numbers = new int[3];
String text = "hello";
```

可以把引用理解成对象在内存中的“地址”。变量通过这个引用找到真正的对象。

## 每次 new 通常都会创建新对象

```java
Baby a = new Baby();
Baby b = new Baby();
```

即使两个对象内部的数据完全相同，它们依然是不同对象。

```java
System.out.println(a == b); // false
```

对对象使用 `==`，比较的是两个变量是否保存了同一个引用，而不是对象内部内容是否相同。

## 多个变量可以指向同一个对象

```java
Baby baby1 = new Baby();
Baby baby2 = new Baby();

baby1 = baby2;
```

赋值后，`baby1` 和 `baby2` 指向同一个对象。如果执行：

```java
baby1.name = "Alice";
```

那么通过 `baby2.name` 也能看到 `Alice`。

## 修改字段不会改变引用本身

```java
Baby myBaby = new Baby();
myBaby.name = "davy";
myBaby.name = "david";
```

这里改变的是对象内部的 `name` 字段，`myBaby` 保存的引用并没有改变。

可以使用房子类比：

- 引用变量是房子的地址；
- 对象是房子；
- 字段是房子里的家具；
- 根据地址找到房子后，可以调整家具，但地址本身没有改变。

## 方法参数与引用

```java
static void change(int x, int[] values, Baby baby) {
    x = 99;
    values[0] = 99;
    baby.name = "99";
}
```

调用后：

- 基本类型 `x` 的外部值不会改变；
- 数组内容可能被修改；
- 对象字段可能被修改。

原因是 Java 始终按值传递。基本类型复制的是实际值；引用类型复制的是引用值。两个引用副本仍然可以指向同一个对象，因此通过其中一个引用修改对象，另一个引用也能看到变化。

## 本篇小结

类是模板，实例是具体对象。基本类型变量直接保存值，引用类型变量保存能够找到对象的引用。`==` 比较对象时判断的是引用是否相同；多个变量指向同一对象时，通过任意一个变量修改字段，其他变量也能观察到变化。
