---
title: 链表的游标实现
date: 2022-04-15
categories:
  - 算法
tags:
  - 算法
---

## 概述

链表的游标实现基本原理是使用数组初始化一段内存，经过初始化，数组中每一个元素包含一个 next 属性用于之后生成的链表中指向链表的下一个元素或者指向下一个未使用的内存，将数组中的某一个元素用作游标来指向下一个可使用的内存，通过取出当前可用内存进行赋值然后再将游标的下移来实现链表的 malloc 和插入功能，通过游标的回退实现链表的 free 功能。

## 代码实现

### 初始化

```ts
type ElementType = number;
export type Position = number;
export type List = number;

interface Node {
  Element: ElementType;
  Next: Position;
}

let SpaceSize = 10;
let CursorSpace: Node[] = new Array(SpaceSize);

let InitializeCursorSpace = function (): void {
  let i: number;

  for (i = 0; i < SpaceSize; i++) {
    CursorSpace[i] = {
      Element: 0,
      Next: i + 1,
    };
  }

  CursorSpace[SpaceSize - 1].Next = 0;
};
```

#### 初始化后数组的基本结构

```ts

┌─────────┬─────────┬──────┐
│ (index) │ Element │ Next │
├─────────┼─────────┼──────┤
│    0    │    0    │  1   │
│    1    │    0    │  2   │
│    2    │    0    │  3   │
│    3    │    0    │  4   │
│    4    │    0    │  5   │
│    5    │    0    │  6   │
│    6    │    0    │  7   │
│    7    │    0    │  8   │
│    8    │    0    │  9   │
│    9    │    0    │  0   │
└─────────┴─────────┴──────┘
```

最后一个元素的 next 为 0，代表此元素为数组的最后一个元素，在执行 malloc 操作的时候如果已经到了最后一个元素需要进行提示不能再赋值

### 生成和回收可用元素

```ts
let CursorAlloc = function (): Position {
  let P = CursorSpace[0].Next;

  CursorSpace[0].Next = CursorSpace[P].Next;

  return P;
};

let CursorFree = function (P: Position): void {
  CursorSpace[P].Next = CursorSpace[0].Next;
  CursorSpace[0].Next = P;
};
```

### 生成链表

```ts
let MakeEmpty = function (L: List | null): List {
  if (L !== null) {
    DeleteList(L);
  }

  L = CursorAlloc();

  if (L === 0) {
    FatalError("Out of memory!");
  }

  CursorSpace[L].Next = 0;

  return L;
};
```

```ts
let L = Cursor.MakeEmpty(null);
```

调用 MakeEmpty 可以初始化返回一个链表，如果参数传入一个链表可以将此链表表头置空然后将其链表所有元素重新进行回收变为可用内存，此方法可以调用多次生成多条链表

#### 初始化后链表后的基本结构

```ts
┌─────────┬─────────┬──────┐
│ (index) │ Element │ Next │
├─────────┼─────────┼──────┤
│    0    │    0    │  2   │
│    1    │    0    │  0   │
│    2    │    0    │  3   │
│    3    │    0    │  4   │
│    4    │    0    │  5   │
│    5    │    0    │  6   │
│    6    │    0    │  7   │
│    7    │    0    │  8   │
│    8    │    0    │  9   │
│    9    │    0    │  0   │
└─────────┴─────────┴──────┘
```

初始化链表会将当前游标所指的可用的元素作为表头使用，并将 next 赋值为 0 代表着此元素是该链表的最后一个元素

### 插入数据

```ts
let Insert = function (X: ElementType, L: List, P: Position) {
  let TmpCell: Position;

  TmpCell = CursorAlloc();
  if (TmpCell === 0) {
    FatalError("Out of space!!!");
  }

  CursorSpace[TmpCell].Element = X;
  CursorSpace[TmpCell].Next = CursorSpace[P].Next;
  CursorSpace[P].Next = TmpCell;
};
```

```ts
for (i = 1; i < 4; i++) {
  Cursor.Insert(i, L, P);
  P = Cursor.Advance(P);
}
```

#### 插入数据后链表后的基本结构

```ts
┌─────────┬─────────┬──────┐
│ (index) │ Element │ Next │
├─────────┼─────────┼──────┤
│    0    │    0    │  5   │
│    1    │    0    │  2   │
│    2    │    1    │  3   │
│    3    │    2    │  4   │
│    4    │    3    │  0   │
│    5    │    0    │  6   │
│    6    │    0    │  7   │
│    7    │    0    │  8   │
│    8    │    0    │  9   │
│    9    │    0    │  0   │
└─────────┴─────────┴──────┘
```

加入数据即新的元素赋值后将上一个元素指向新的元素，新的元素的 next 指向上一个元素原来的 next 来达到中间插入的效果，如果是插入一个链表的末尾则新的元素的 next 将赋值为 0 表示新的元素为链表的最后一个元素

### 删除数据

```ts
let Delete = function (X: ElementType, L: List) {
  let P: Position, TmpCell: Position;

  P = FindPrevious(X, L);

  if (!IsLast(P, L)) {
    TmpCell = CursorSpace[P].Next;
    CursorSpace[P].Next = CursorSpace[TmpCell].Next;
    CursorFree(TmpCell);
  }
};
```

```ts
Cursor.Delete(2, L);
```

#### 删除数据后链表后的基本结构

```ts
┌─────────┬─────────┬──────┐
│ (index) │ Element │ Next │
├─────────┼─────────┼──────┤
│    0    │    0    │  3   │
│    1    │    0    │  2   │
│    2    │    1    │  4   │
│    3    │    2    │  5   │
│    4    │    3    │  0   │
│    5    │    0    │  6   │
│    6    │    0    │  7   │
│    7    │    0    │  8   │
│    8    │    0    │  9   │
│    9    │    0    │  0   │
└─────────┴─────────┴──────┘
```

删除即回收当前元素并将删除元素的上一个元素的 next 指向删除元素的下一个元素达到剔除数据的效果

### 删除列表

```ts
let DeleteList = function (L: List) {
  let P: Position, Tmp: Position;
  P = CursorSpace[L].Next;
  CursorSpace[L].Next = 0;

  while (P !== 0) {
    Tmp = CursorSpace[P].Next;
    CursorFree(P);
    P = Tmp;
  }
};
```

```ts
Cursor.DeleteList(L);
```

#### 删除链表后链表后的基本结构

```ts
┌─────────┬─────────┬──────┐
│ (index) │ Element │ Next │
├─────────┼─────────┼──────┤
│    0    │    0    │  4   │
│    1    │    0    │  0   │
│    2    │    1    │  3   │
│    3    │    2    │  5   │
│    4    │    3    │  2   │
│    5    │    0    │  6   │
│    6    │    0    │  7   │
│    7    │    0    │  8   │
│    8    │    0    │  9   │
│    9    │    0    │  0   │
└─────────┴─────────┴──────┘
```

删除链表即将表头置空然回收链表的所有数据

## 完整代码

```ts
// cursor.ts

type ElementType = number;
export type Position = number;
export type List = number;

interface Node {
  Element: ElementType;
  Next: Position;
}

let SpaceSize = 10;
let CursorSpace: Node[] = new Array(SpaceSize);

let CursorAlloc = function (): Position {
  let P = CursorSpace[0].Next;

  CursorSpace[0].Next = CursorSpace[P].Next;

  return P;
};

let CursorFree = function (P: Position): void {
  CursorSpace[P].Next = CursorSpace[0].Next;
  CursorSpace[0].Next = P;
};

let InitializeCursorSpace = function (): void {
  let i: number;

  for (i = 0; i < SpaceSize; i++) {
    CursorSpace[i] = {
      Element: 0,
      Next: i + 1,
    };
  }

  CursorSpace[SpaceSize - 1].Next = 0;
};

let MakeEmpty = function (L: List | null): List {
  if (L !== null) {
    DeleteList(L);
  }

  L = CursorAlloc();

  if (L === 0) {
    FatalError("Out of memory!");
  }

  CursorSpace[L].Next = 0;

  return L;
};

let IsEmpty = function (L: List): boolean {
  return CursorSpace[L].Next === 0;
};

let IsLast = function (P: Position, L: List): boolean {
  return CursorSpace[P].Next === 0;
};

let Find = function (X: ElementType, L: List): Position {
  let P: Position;

  P = CursorSpace[L].Next;

  while (P && CursorSpace[P].Element !== X) {
    P = CursorSpace[P].Next;
  }

  return P;
};

let Delete = function (X: ElementType, L: List) {
  let P: Position, TmpCell: Position;

  P = FindPrevious(X, L);

  if (!IsLast(P, L)) {
    TmpCell = CursorSpace[P].Next;
    CursorSpace[P].Next = CursorSpace[TmpCell].Next;
    CursorFree(TmpCell);
  }
};

let FindPrevious = function (X: ElementType, L: List): Position {
  let P: Position;

  P = L;

  while (
    CursorSpace[P].Next &&
    CursorSpace[CursorSpace[P].Next].Element !== X
  ) {
    P = CursorSpace[P].Next;
  }

  return P;
};

let Insert = function (X: ElementType, L: List, P: Position) {
  let TmpCell: Position;

  TmpCell = CursorAlloc();
  if (TmpCell === 0) {
    FatalError("Out of space!!!");
  }

  CursorSpace[TmpCell].Element = X;
  CursorSpace[TmpCell].Next = CursorSpace[P].Next;
  CursorSpace[P].Next = TmpCell;
};

let DeleteList = function (L: List) {
  let P: Position, Tmp: Position;
  P = CursorSpace[L].Next;
  CursorSpace[L].Next = 0;

  while (P !== 0) {
    Tmp = CursorSpace[P].Next;
    CursorFree(P);
    P = Tmp;
  }
};

let Header = function (L: List): Position {
  return L;
};

let First = function (L: List): Position {
  return CursorSpace[L].Next;
};

let Advance = function (P: Position): Position {
  return CursorSpace[P].Next;
};

let Retrieve = function (P: Position): ElementType {
  return CursorSpace[P].Element;
};

let getFirstMemory = function (): Position {
  return CursorSpace[0].Next;
};

let FatalError = function (err: string) {
  console.log(err);
};

let getCursorSpace = function (): Node[] {
  return CursorSpace;
};

export default {
  CursorAlloc,
  CursorFree,
  InitializeCursorSpace,
  MakeEmpty,
  IsEmpty,
  IsLast,
  Find,
  Delete,
  FindPrevious,
  Insert,
  DeleteList,
  Header,
  First,
  Advance,
  Retrieve,
  getFirstMemory,
  getCursorSpace,
};
```

```ts
//index.ts

import Cursor, { List, Position } from "./cursor";

let PrintList = function () {
  let CursorSpace = Cursor.getCursorSpace();

  console.table(
    CursorSpace.map((item) => {
      return { Element: item.Element, Next: item.Next };
    })
  );
};

let L: List;
let P: Position;
let i: number;

Cursor.InitializeCursorSpace();

L = Cursor.MakeEmpty(null);
P = Cursor.Header(L);

for (i = 1; i < 4; i++) {
  Cursor.Insert(i, L, P);
  P = Cursor.Advance(P);
}

Cursor.Delete(2, L);

Cursor.DeleteList(L);

PrintList();
```
