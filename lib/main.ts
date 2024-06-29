import { nanoid } from 'nanoid';

interface ConcurrencyOptions {
  threshold?: number,
}

interface Task {
  key: string,
  status: TaskStatusEnum,
  asyncFn: () => Promise<any>,
  name?: string,
  priority?: number
}

enum TaskStatusEnum {
  WAIT= 1,
  PENDING= 2,
  FULFILLED= 3,
  REJECTED= 4,
}

type TaskOptions = Omit<Task, 'key'|'status'>;

export default class Concurrency {
  // all tasks
  private tasks: Task[] = [];

  private threshold = 5;

  constructor(options?: ConcurrencyOptions) {
    if (typeof options?.threshold === 'number') {
      this.threshold = options.threshold;
    }
  }

  /**
   * add task to prepare execute
   * @param options
   */
  addTask(options: TaskOptions) {
    if (!options?.asyncFn) {
      console.error('addTask params is wrong');
      return;
    }

    let opt: Task = this.createTask(options);

    if (!this.tasks.some((el) => el.key === opt.key)) {
      this.tasks.push(opt);
    }
  }

  /**
   * add task and try execute
   * @param options
   */
  addAndFlushTasks(options: TaskOptions) {
    return new Promise(resolve => {
      this.addTask(options);
      this.flushTasks(resolve);
    })
  }

  /**
   * to execute tasks
   */
  execute() {
    return new Promise((resolve) => {
      this.flushTasks(resolve);
    })
  }

  clear() {
    this.tasks = [];
  }

  /**
   * The smaller the value of the priority attribute, the higher the priority.
   * @param options
   * @private
   */
  private createTask(options: TaskOptions) {
    let opt: Task = {
      key: nanoid(),
      status: TaskStatusEnum.WAIT,
      asyncFn: options.asyncFn,
      name: options.name,
      priority: options.priority || Number.MAX_SAFE_INTEGER,
    }
    return opt;
  }

  private async runTask(task: Task, resolve: any) {
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
      })
  }

  private flushTasks(resolve: any){
    let waitTask = this.getHighestPriorityWaitTask();
    if (!waitTask) {
      return resolve();
    }

    let pendingTasks = this.tasks.filter((el) => el.status === TaskStatusEnum.PENDING);

    while(waitTask && pendingTasks.length < this.threshold) {
      this.runTask(waitTask, resolve).finally(() => {
        this.flushTasks(resolve);
      })
      waitTask = this.getHighestPriorityWaitTask();
      pendingTasks = this.tasks.filter((el) => el.status === TaskStatusEnum.PENDING);
    }
  }

  private getHighestPriorityWaitTask(){
    let unStartedTasks = this.tasks.filter((el) => el.status === TaskStatusEnum.WAIT);
    if (!unStartedTasks.length) {
      return null;
    }

    let task = this.minBy(unStartedTasks, (el: Task) => el.priority);
    return task;
  }

  private minBy(array: any[], iteratee: Function) {
    if (!Array.isArray(array) || array.length === 0) {
      return undefined;
    }

    let minValue = iteratee(array[0]);
    let minElement = array[0];

    for (let i = 1; i < array.length; i++) {
      const value = iteratee(array[i]);
      if (value < minValue) {
        minValue = value;
        minElement = array[i];
      }
    }

    return minElement;
  }
}
