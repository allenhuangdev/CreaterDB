# Problem 2 – Debug `getYoutubeData`

## 🦋 原始錯誤分析

### 問題 1: `var` 造成 scope 漏洞

```js
for (var i = 0; i < youtubeIds.length; i++) {
  var promise = new Promise(async (resolve, reject) => {
    var channelURL = `https://www.youtube.com/${youtubeIds[i]}`;
    ...
  });
}
```

- `var` 是函式作用域（function-scoped），導致非同步函式中讀到的 `i` 值永遠是最後一個值（例如 3）。
- 所以所有都會拿到 `youtubeIds[3]`，而不是各自獨立的值。

✅ 解法：改用 `let`（block-scoped）或直接抽出變數 `const id = youtubeIds[i]`。

---

### 問題 2: 不必要的 `new Promise`

```js
var promise = new Promise(async (resolve, reject) => {
  try {
    ...
  } catch (e) {
    reject(e);
  }
});
```

- `async function` 本身就會回傳 `Promise`，不需要重新包裝一個 `new Promise`
- 這種寫法稱為 **Promise constructor antipattern**

✅ 解法：直接使用 async function 則可。

---

## ✅ 修正後程式碼

```ts
async function getYoutubeData(youtubeIds) {
  const promises = [];

  for (let i = 0; i < youtubeIds.length; i++) {
    promises.push(
      (async () => {
        const id = youtubeIds[i];
        const channelURL = `https://www.youtube.com/${id}`;
        const channelPage = await getPage(channelURL);

        return { channelPage, videosPage };
      })()
    );
  }

  return Promise.all(promises);
}
```

## 目錄結構

```
problem2-debug/
├── fixed-code.js
└── description.md ← 解釋問題
```
