---
title: Promise内存泄漏
date: 2022-09-01
permalink: /promise
categories:
  - 前端
tags:
  - 前端
---

## 概述
Promise抛出错误如果不进行catch会造成内存泄漏

## 示例
在vue项目中使用以下代码在chrome中使用Performance Monitor查看效果如下蓝色为Js heap size,绿色为DOM Nodes

```js
    // 捕获错误
    for (let index = 0; index < 500000; index++) {
        this.array.push({
            date: new Date()
        });
    }

    new Promise((res, rej) => {
        throw new Error();
    }).catch(e => {})
```

![捕获错误](/proise_catch.png)

```js
    // 不捕获错误
    for (let index = 0; index < 500000; index++) {
        this.array.push({
            date: new Date()
        });
    }

    new Promise((res, rej) => {
        throw new Error();
    })
```

![不捕获错误](/promise_nocatch.png)