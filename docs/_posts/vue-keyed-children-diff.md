---
title: Vue3 更新子节点时带key子节点的diff算法
date: 2022-05-27
permalink: /vue3-keyed-children-diff
categories:
  - 前端
tags:
  - 前端
---

#### 备注

cloneIfMounted：当此虚拟节点已被挂载则克隆一份；  
normalizeVNode：判断传入参数是否是虚拟节点，是则调用 cloneIfMounted 否则创建一个虚拟节点；  
patch：用于挂载或更新虚拟节点，第一个参数为空则挂载，不为空则进行更新；  
unmount：用于卸载虚拟节点；  
isSameVNodeType：判断两个虚拟节点类型是否相同；  
getSequence：获得最长上升子序列；  
move：调用 insertBefore 方法将虚拟节点的真实元素插入到父元素指定节点前；

#### 代码

```js
const patchKeyedChildren = (
    c1: VNode[], // 已挂载的子节点数组
    c2: VNodeArrayChildren, // 当前将要更新的子节点数组
    container: RendererElement, // 父节点元素
    parentAnchor: RendererNode | null, // 父节点的最后一个元素，当虚拟节点类型为Fragment时会在挂载时在父元素最后插入一个空字符用于之后子元素插入时的定位
    parentComponent: ComponentInternalInstance | null,
    parentSuspense: SuspenseBoundary | null,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean
  ) => {
    let i = 0 // 标记已挂载子节点和将要更新的子节点已处理到头部哪一个元素
    const l2 = c2.length // 当前将要更新的子节点数组长度
    let e1 = c1.length - 1 // 已挂载子节点的end index，用于标记已挂载子节点已处理到尾部哪一个元素
    let e2 = l2 - 1 // 将要更新的子节点的end index，用于标记将要更新的子节点已处理到尾部哪一个元素

    // 因为后面会从数组的头部和尾部分别处理，所以使用i、e1、e2来记录头部尾部分别已经处理到哪一个元素了

    // (a b) c
    // (a b) d e
    // 1. 从头开始判断节点是否相同
    // 循环遍历已挂载节点和将要更新节点是否类型一致，一致则复用，进行更新操作，否则跳出循环

    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = (c2[i] = optimized
        ? cloneIfMounted(c2[i] as VNode)
        : normalizeVNode(c2[i]))
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        )
      } else {
        break
      }
      i++
    }

    // a (b c)
    // d e (b c)
    // 2. 从尾部开始判断节点是否相同
    // 循环遍历已挂载节点和将要更新节点是否类型一致，一致则复用，进行更新操作，否则跳出循环
    // 同时，如果判断两节点类型相同则将已挂载子节点的end index和将要更新子节点的end index减一
    // 将两个end index减一之后得到的end index和i的值可以知道哪些节点已经做过处理，
    // 而在i和 end index中间的元素则是接下来需要处理的元素

    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = (c2[e2] = optimized
        ? cloneIfMounted(c2[e2] as VNode)
        : normalizeVNode(c2[e2]))
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized
        )
      } else {
        break
      }
      e1--
      e2--
    }

    // (a b)
    // (a b) c
    // i = 2, e1 = 1, e2 = 2

    // (a b)
    // c (a b)
    // i = 0, e1 = -1, e2 = 0

    // 3. 在之前的节点中增加了新节点
    // 如果i大于原来已挂载子节点的end index说明原来已挂载子节点中所有节点都已处理完
    // 剩下要处理的只有新加的子节点，对新加的子节点进行挂载操作

    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? (c2[nextPos] as VNode).el : parentAnchor
        while (i <= e2) {
          patch(
            null,
            (c2[i] = optimized
              ? cloneIfMounted(c2[i] as VNode)
              : normalizeVNode(c2[i])),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          )
          i++
        }
      }
    }

    // (a b) c
    // (a b)
    // i = 2, e1 = 2, e2 = 1

    // a (b c)
    // (b c)
    // i = 0, e1 = 0, e2 = -1

    // 4. 卸载原来已挂载子节点中的被删除的节点
    // 如果i大于将要更新子节点的end index说明将要更新子节点中所有节点都已处理完
    // 剩下要处理的只有原来已挂载子节点中被删除子节点，对删除子节点进行卸载操作

    else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true)
        i++
      }
    }

    // [i ... e1 + 1]: a b [c d e] f g
    // [i ... e2 + 1]: a b [e d c h] f g
    // i = 2, e1 = 4, e2 = 5

    // 5. 对剩下的未处理的元素进行操作，即i 和 end index间的元素

    else {

      // 因为i需要用于遍历，所以暂存已挂载和将要更新的子节点从头部开始已经处理到哪一个节点

      const s1 = i
      const s2 = i

      // 5.1 通过keyToNewIndexMap来记录已挂载和将要更新的子节点中未处理的子节点有哪些是可以复用的
      // 遍历将要更新的子节点来初始化keyToNewIndexMap
      // 之后需要遍历已挂载的子节点中未处理的节点，然后通过判断节点的key在keyToNewIndexMap是否能找到不为undefined的值
      // 如果能找到说明已挂载和将要更新的子节点中有key一致的节点，可以进行复用，否则直接卸载不匹配的节点

      const keyToNewIndexMap: Map<string | number | symbol, number> = new Map()
      for (i = s2; i <= e2; i++) {
        const nextChild = (c2[i] = optimized
          ? cloneIfMounted(c2[i] as VNode)
          : normalizeVNode(c2[i]))
        if (nextChild.key != null) {
          if (__DEV__ && keyToNewIndexMap.has(nextChild.key)) {
            warn(
              `Duplicate keys found during update:`,
              JSON.stringify(nextChild.key),
              `Make sure keys are unique.`
            )
          }
          keyToNewIndexMap.set(nextChild.key, i)
        }
      }

      // 5.2

      let j
      let patched = 0 // 将要更新的子节点中已复用的节点数
      const toBePatched = e2 - s2 + 1 // 将要更新的子节点中未处理的节点数量
      let moved = false // 已挂载的子节点在复用时是否在将要更新的节点中位置发生过移动

      // 在后续处理中会遍历已挂载子节点中未处理的节点
      // 在顺序的遍历过程中如果该节点能够复用，则通过一个newIndex来记录已挂载的子节点在将要更新的子节点中对应着哪个位置
      // maxNewIndexSoFar则记录遍历过程中出现的最大的位置值
      // 通过当前的newIndex和已出现的最大的位置值比较来判断是否有在已挂载子节点中位置小的节点在将要更新的子节点中被移动到了之前位置比他大的节点后面
      // 以此来判断在已挂载子节点中按顺序从小到大排序的节点在将要更新的节点中是否顺序也是从小到大排列（中间可能会插入新的节点，所以只是顺序是从小到大但他们的index不一定一致）
      // 如果排序还是从小到大则未移动，否则，节点被移动了
      // 因为在复用过程中只会更新节点的元素内容而不会更新它所在位置所以如果不做处理则会导致更新后元素位置错误，因此需要记录被移动的元素做额外处理

      // a b c
      // d a f b g c e
      // 原来节点在新节点中顺序为 1 3 5，顺序为从小到大，则未移动

      // a b c
      // d b a g c e
      // 原来节点在新节点中顺序为 2 1 4，顺序不是从小到大，则说明有节点移动，移动的节点为a

      let maxNewIndexSoFar = 0

      const newIndexToOldIndexMap = new Array(toBePatched) // 记录可复用时将要更新的节点在已挂载子节点中对应的位置
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0 // 将对应位置初始化为0，0代表未复用

      // 遍历已挂载节点中未处理的节点
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i]

        // 在遍历过程里如果将要更新子节点中已复用的节点等于未处理的节点数则说明节点已全部处理完，如果遍历还未结束，说明已挂载的节点中剩余的节点在后续没有用到需要全部卸载
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true)
          continue
        }

        let newIndex

        // 通过判断是否能在将要更新子节点中找到对应的key或者找到对应相同类型的节点来判断是否可复用
        // 如果可复用，找到已挂载子节点当前遍历节点在将要更新子节点中对应的位置
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          for (j = s2; j <= e2; j++) {
            if (
              newIndexToOldIndexMap[j - s2] === 0 &&
              isSameVNodeType(prevChild, c2[j] as VNode)
            ) {
              newIndex = j
              break
            }
          }
        }

        // 如果不可复用，卸载当前已挂载节点
        // 否则，复用该节点，并记录复用节点在已挂载子节点中对应的位置
        if (newIndex === undefined) {
          unmount(prevChild, parentComponent, parentSuspense, true)
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }
          patch(
            prevChild,
            c2[newIndex] as VNode,
            container,
            null,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          )
          patched++
        }
      }

      // 5.3

      // 得到最长上升子序列
      // 因为在原来已挂载的子节点里节点是按从小到大的顺序排列的
      // 所以通过newIndexToOldIndexMap的最长上升子序列可以知道哪些被复用的节点在新的子节点中也是按从小到大的顺序排列的
      // 这些节点不用处理，其他的节点会被认为被移动过

      // a b c d
      // e b f c g a d h
      // newIndexToOldIndexMap: [0, 2, 0, 3, 0, 1, 4, 0]
      // increasingNewIndexSequence: [0, 1, 3, 6]

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : EMPTY_ARR

      j = increasingNewIndexSequence.length - 1

      // 从尾部开始遍历将要更新子节点，未复用的进行挂载，已复用且未移动的不处理，被移动的进行move操作
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i
        // 将要处理的子节点
        const nextChild = c2[nextIndex] as VNode
        // 所要插入位置
        const anchor =
          nextIndex + 1 < l2 ? (c2[nextIndex + 1] as VNode).el : parentAnchor

        // 等于0说明未复用
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
            null,
            nextChild,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized
          )
        } else if (moved) {
          // 如果有被移动过
          // 如果当前是复用元素，且该元素位置在最长上升子序列中未找到说明该节点被移动了
          // j < 0说明所有未移动的子节点已全部处理剩下的都是被移动的节点
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, MoveType.REORDER)
          } else {
            j--
          }

        }
      }
    }
  }
```

> 源码地址[Vue3](https://github.com/vuejs/core)
