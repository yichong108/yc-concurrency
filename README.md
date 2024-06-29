# yc-concurrency

To limit the concurrency of async tasks. When there are available slots in the execution pool, fetch high-priority tasks from the waiting queue for execution.

- You can set a maximum concurrency limit.

- You can dynamically insert concurrent tasks during execution.



## Installing

Using npm:

```bash
npm install --save yc-concurrency
```

Using Yarn:

```bash
yarn add yc-concurrency
```

Using pnpm:
```bash
pnpm add yc-concurrency
```



## Example

```js
import Concurrency from 'yc-concurrency';

function createAsyncFn(i) {
  return () => new Promise(resolve => {
    setTimeout(() => {
      console.log(i);
      resolve(true);
    }, 1000);
  });
}

function createAsyncFnList(num) {
  let list = [];
  for(let i = 1; i <= num; i++) {
    let fn = createAsyncFn(String(i));
    list.push(fn)
  }
  return list;
}

let con = new Concurrency({threshold: 3});

let list = createAsyncFnList(10);
for(let item of list) {
  con.addTask({
    asyncFn: item,
  })
}

con.execute().then(() => {
  console.log('all done');
});

setTimeout(() => {
  con.addAndFlushTasks({
    asyncFn: createAsyncFn('addAndFlushTasks'),
    priority: 1
  }).then(() => {
    console.log('all done');
  })
}, 2000);
```

