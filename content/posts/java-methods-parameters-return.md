---
title: "Java 方法、参数与返回值"
date: "2026-07-11"
description: "整理方法的定义与调用、参数、void、返回值、作用域和值传递。"
tags: ["Java", "方法"]
---

方法可以把一段明确的操作封装起来。大程序通常由很多小方法组成，每个方法只负责一件相对清楚的事情。

## 方法是什么

下面这句本身就是一个方法声明：

```java
public static void main(String[] arguments)
```

定义一个无参数、无返回值的方法：

```java
public static void sayHello() {
    System.out.println("Hello");
}
```

调用方法：

```java
sayHello();
```

## 方法应该放在哪里

Java 中，方法应该定义在类里面，但不能定义在另一个方法内部。

错误写法：

```java
public static void main(String[] arguments) {
    public static void threeLines() {
    }
}
```

正确写法：

```java
class NewLine {
    public static void threeLines() {
    }

    public static void main(String[] arguments) {
    }
}
```

## 参数

参数让方法能够接收外部数据。

```java
public static void printSquare(int x) {
    System.out.println(x * x);
}
```

调用时把实际值传进去：

```java
printSquare(3);
```

多个参数之间使用逗号分隔：

```java
public static void add(int a, int b) {
    System.out.println(a + b);
}

add(2, 3);
```

如果参数类型是 `double`，传入 `int` 时 Java 可以自动转换：

```java
public static void printSquare(double x) {
    System.out.println(x * x);
}

printSquare(5); // 输出 25.0
```

## void 与返回值

`void` 表示方法不返回任何值。

```java
public static void sayHello() {
    System.out.println("Hello");
}
```

它只是完成输出，没有把结果交给调用者。

有返回值的方法需要写明返回类型，并使用 `return`：

```java
public static double square(double x) {
    return x * x;
}
```

调用后可以继续参与计算：

```java
double result = square(5) + 10;
```

直接打印和返回结果的区别：

```java
public static void printSquare(double x) {
    System.out.println(x * x);
}

public static double square(double x) {
    return x * x;
}
```

`printSquare()` 只负责输出；`square()` 把结果返回，因此更容易复用。

## 变量作用域

变量只在定义它的代码块中有效。代码块就是一对大括号 `{}`。

```java
public static void test(int x) {
    System.out.println(x);
}
```

参数 `x` 只在 `test()` 方法内部有效。

## 参数不会改变外部基本类型变量

```java
class SquareChange {
    public static void printSquare(int x) {
        x = x * x;
        System.out.println("printSquare x = " + x);
    }

    public static void main(String[] arguments) {
        int x = 5;
        printSquare(x);
        System.out.println("main x = " + x);
    }
}
```

输出中，方法内部的 `x` 会变成 `25`，但 `main` 中的 `x` 仍然是 `5`。调用方法时传入的是当前值的副本，两个 `x` 是不同的变量。

## 方法与抽象

方法是程序的构建模块：

- 可以单独开发和测试；
- 可以重复使用；
- 使用者不必了解内部实现。

例如调用：

```java
Math.pow(2, 3);
```

我们只需要知道它会返回幂运算结果，不必先理解内部如何完成计算。这种隐藏实现细节、只暴露使用方式的思想叫作抽象。

## 本篇小结

方法必须定义在类中。参数负责接收数据，`void` 方法只执行操作，有返回类型的方法会通过 `return` 交回结果。基本类型参数传入的是值的副本，因此方法内部的重新赋值不会改变外部变量。
