import Concurrency from '../lib/main'

function createAsyncFn(i: string) {
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


let con = new Concurrency({threshold: 1});

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
}, 2000)


