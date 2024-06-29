import Concurrency from '../lib/main';
function createAsyncFunction(i) {
    return () => new Promise(resolve => {
        setTimeout(() => {
            console.log(i);
            resolve(undefined);
        }, 1000);
    });
}
function createAsyncFnList(num) {
    let list = [];
    for (let i = 1; i < num; i++) {
        let fn = createAsyncFunction(String(i));
        list.push(fn);
    }
    return list;
}
let con = new Concurrency({ threshold: 1 });
let list = createAsyncFnList(10);
for (let item of list) {
    con.addTask({
        asyncFn: item,
    });
}
con.excecute().then(() => {
    console.log('all done');
});
setTimeout(() => {
    con.addAndFlushTasks({
        asyncFn: createAsyncFunction('addAndFlushTasks'),
        priority: 1
    }).then(() => {
        console.log('all done');
    });
}, 2000);
