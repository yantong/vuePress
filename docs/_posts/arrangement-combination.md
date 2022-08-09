---
title: 排列组合算法
date: 2022-08-09
permalink: /arrangement-combination
categories:
  - 前端
tags:
  - 前端
---

## 排列

```js
function arrangement(
  remainItems,
  count = remainItems.length,
  arrangementItems = []
) {
  let res = [];

  if (count > remainItems.length) count = remainItems.length;

  if (!count) {
    res = [[...arrangementItems]];
  } else {
    let length = remainItems.length;

    for (let index = 0; index < length; index++) {
      arrangementItems.push(remainItems[index]);
      remainItems.splice(index, 1);

      let data = arrangement(remainItems, count - 1, arrangementItems);

      res.push(...data);

      remainItems.splice(index, 0, arrangementItems.pop());
    }
  }

  return res;
}
```

## 组合

```js
function combination(
  remainItems,
  count = remainItems.length,
  combinationtItems = []
) {
  let res = [];

  if (count > remainItems.length) count = remainItems.length;

  if (!count) {
    res = [[...combinationtItems]];
  } else {
    let length = remainItems.length;

    for (let index = 0; index <= length - count; index++) {
      combinationtItems.push(remainItems[index]);

      let data = combination(
        remainItems.slice(index + 1),
        count - 1,
        combinationtItems
      );

      res.push(...data);

      combinationtItems.pop();
    }
  }

  return res;
}
```
