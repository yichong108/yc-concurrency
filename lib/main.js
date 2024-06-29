import { minBy } from "lodash-es";
import { nanoid } from 'nanoid';
export var TaskStatusEnum;
(function (TaskStatusEnum) {
    // 未开始执行
    TaskStatusEnum[TaskStatusEnum["WAIT"] = 1] = "WAIT";
    // 任务执行进行中
    TaskStatusEnum[TaskStatusEnum["PENDING"] = 2] = "PENDING";
    // 执行成功
    TaskStatusEnum[TaskStatusEnum["FULFILLED"] = 3] = "FULFILLED";
    // 执行失败
    TaskStatusEnum[TaskStatusEnum["REJECTED"] = 4] = "REJECTED";
})(TaskStatusEnum || (TaskStatusEnum = {}));
export default class Concurrency {
    constructor(options) {
        // 记录所有任务状态
        Object.defineProperty(this, "tasks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "threshold", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Number.MAX_SAFE_INTEGER
        });
        this.threshold = options?.threshold || 1;
    }
    createTask(options) {
        let opt = {
            key: nanoid(),
            status: TaskStatusEnum.WAIT,
            asyncFn: options.asyncFn,
            name: options.name,
            priority: options.priority || Number.MAX_SAFE_INTEGER,
        };
        return opt;
    }
    addTask(options) {
        let opt = this.createTask(options);
        if (!opt) {
            console.error('addTask error');
            return;
        }
        if (!this.tasks.some((el) => el.key === opt.key)) {
            this.tasks.push(opt);
        }
    }
    addAndFlushTasks(options) {
        return new Promise(resolve => {
            this.addTask(options);
            this.flushTasks(resolve);
        });
    }
    async runTask(task, resolve) {
        // console.info(TAG, `runTask`, task.key);
        task.status = TaskStatusEnum.PENDING;
        return task
            .asyncFn()
            .then(() => {
            task.status = TaskStatusEnum.FULFILLED;
        })
            .catch((e) => {
            task.status = TaskStatusEnum.REJECTED;
            console.error(e);
        }).finally(() => {
            let waitTask = this.getHighestPriorityWaitTask();
            if (!waitTask) {
                resolve();
            }
        });
    }
    flushTasks(resolve) {
        let waitTask = this.getHighestPriorityWaitTask();
        if (!waitTask) {
            // console.warn('当前没有未执行的任务');
            return;
        }
        let pendingTasks = this.tasks.filter((el) => el.status === TaskStatusEnum.PENDING);
        while (waitTask && pendingTasks.length < this.threshold) {
            this.runTask(waitTask, resolve).finally(() => {
                this.flushTasks(resolve);
            });
            waitTask = this.getHighestPriorityWaitTask();
            pendingTasks = this.tasks.filter((el) => el.status === TaskStatusEnum.PENDING);
        }
    }
    getHighestPriorityWaitTask() {
        let unStartedTasks = this.tasks.filter((el) => el.status === TaskStatusEnum.WAIT);
        if (!unStartedTasks.length) {
            return null;
        }
        let task = minBy(unStartedTasks, (el) => el.priority);
        return task;
    }
    clear() {
        this.tasks = [];
    }
    excecute() {
        return new Promise((resolve) => {
            this.flushTasks(resolve);
        });
    }
}
