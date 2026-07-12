---
title: "Java 实践：读取文件并判断 3×3 幻方"
date: "2026-07-09"
description: "使用文件读取、字符串拆分和二维数组，判断一个 3×3 矩阵是否为幻方。"
tags: ["Java", "二维数组", "实践"]
---

这个练习把文件读取、字符串处理、二维数组、循环和方法拆分放在了一起。目标是读取两个文本文件，并判断其中的 3×3 整数矩阵是否满足幻方条件。

## 判断条件

一个 3×3 矩阵是本题中的幻方，需要满足：

- 每一行的和等于 `15`；
- 每一列的和等于 `15`；
- 两条对角线的和都等于 `15`。

示例文件：

```text
2 7 6
9 5 1
4 3 8
```

## 核心思路

1. 创建一个 `int[3][3]` 二维数组；
2. 使用 `BufferedReader` 一行一行读取文件；
3. 使用 `split()` 把每一行拆成三个字符串；
4. 使用 `Integer.parseInt()` 转成整数；
5. 把数字存入二维数组；
6. 检查三行、三列和两条对角线。

## 完整代码

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class MagicSquare {

    public static void main(String[] args) {
        checkFile("magic1.txt");
        checkFile("magic2.txt");
    }

    public static void checkFile(String fileName) {
        int[][] values = new int[3][3];

        try (BufferedReader reader =
                     new BufferedReader(new FileReader(fileName))) {

            for (int row = 0; row < 3; row++) {
                String line = reader.readLine();

                if (line == null) {
                    System.out.println("文件行数不足：" + fileName);
                    return;
                }

                String[] parts = line.trim().split("\\s+");

                if (parts.length != 3) {
                    System.out.println("每行必须包含三个数字：" + fileName);
                    return;
                }

                for (int column = 0; column < 3; column++) {
                    values[row][column] =
                            Integer.parseInt(parts[column]);
                }
            }

            System.out.println("正在检查文件：" + fileName);
            System.out.println(isMagic(values)
                    ? "这是一个幻方"
                    : "这不是一个幻方");

        } catch (IOException e) {
            System.out.println("文件读取失败：" + fileName);
        } catch (NumberFormatException e) {
            System.out.println("文件中存在无法转换为整数的内容");
        }
    }

    public static boolean isMagic(int[][] values) {
        int target = 15;

        for (int row = 0; row < 3; row++) {
            int rowSum = 0;
            for (int column = 0; column < 3; column++) {
                rowSum += values[row][column];
            }
            if (rowSum != target) {
                return false;
            }
        }

        for (int column = 0; column < 3; column++) {
            int columnSum = 0;
            for (int row = 0; row < 3; row++) {
                columnSum += values[row][column];
            }
            if (columnSum != target) {
                return false;
            }
        }

        int mainDiagonal =
                values[0][0] + values[1][1] + values[2][2];
        if (mainDiagonal != target) {
            return false;
        }

        int otherDiagonal =
                values[0][2] + values[1][1] + values[2][0];
        return otherDiagonal == target;
    }
}
```

## 读取并拆分一行

```java
String line = reader.readLine();
String[] parts = line.trim().split("\\s+");
```

如果读取到：

```text
2 7 6
```

拆分后：

```text
parts[0] = "2"
parts[1] = "7"
parts[2] = "6"
```

`\\s+` 表示一个或多个空白字符，因此连续空格也能正常处理。

## 字符串转整数

```java
values[row][column] = Integer.parseInt(parts[column]);
```

这一步把字符串 `"2"` 转换成整数 `2`，再存入二维数组。

## 为什么拆成两个方法

`checkFile()` 负责文件读取与异常处理，`isMagic()` 只负责判断矩阵。这样每个方法的职责更清楚，也更容易单独测试。

## 本篇小结

这个练习的关键不是死记完整代码，而是理解数据流：文本文件先被逐行读取，再被拆成字符串并转换为整数，最后进入二维数组。判断部分则分别检查行、列和两条对角线，把不同任务拆进方法后，代码会更容易阅读和调试。
