---
title: Vue jsx 和 React jsx 的一些不同点
date: 2022-04-25
permalink: /jsx-diff
categories:
  - 前端
tags:
  - 前端
---

## 事件绑定

vue 用的是横线, react 用的是驼峰 (注: vue2.1 版本已经支持用驼峰)

```js
// vue 2.1-
<a on-click={this.loadMore} href="javascript:;">加载更多</a>
// vue 2.1
<a onClick={this.loadMore} href="javascript:;">加载更多</a>
// react
<a onClick={this.loadMore} href="javascript:;">加载更多</a>
```

## 插入 html 代码

```js
// vue
<div domProps-innerHTML={html} />
// react
<div dangerouslySetInnerHTML={{__html: html}} />
```

## 解构传 props

这个 react 相对简单, 只要是对象里都可以一股脑传过去, vue 却麻烦很多, 每种类型都需要放在对应的特殊顶级属性

```js
// vue
const data = {
  // props
  props: {
    value: "1",
  },
  // 属性
  attrs: {
    id: "id",
  },
  // Dom props
  domProps: {
    innerHTML: "bar",
  },
  // 事件 (不支持修饰符)
  on: {
    click: this.clickHandler,
  },
  // 原生事件
  nativeOn: {
    click: this.nativeClickHandler,
  },
  // class 样式, 类似 `:class`
  class: {
    foo: true,
    bar: false,
  },
  // style 样式, 类似 `:style`
  style: {
    color: "red",
    fontSize: "14px",
  },
  // 其他
  key: "key",
  ref: "ref",
  slot: "slot",
};
return <index-post {...data} />;
```

## slot 和 children

vue 中 slot 的用法

```js
{
    render (h) {
        return <div>{this.$slots.default}</div>
    }
}
```

react 中 children 的用法

```js
{
  return <div>{props.children}</div>;
}
```

Tip: 此内容转自[此处](https://mmxiaowu.com/article/584824c1d4352863efb55471)
