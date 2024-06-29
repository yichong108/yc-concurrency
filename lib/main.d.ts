interface ConcurrencyOptions {
    threshold?: number;
}
interface Task {
    key: string;
    status: TaskStatusEnum;
    asyncFn: () => Promise<any>;
    name?: string;
    priority?: number;
}
declare enum TaskStatusEnum {
    WAIT = 1,
    PENDING = 2,
    FULFILLED = 3,
    REJECTED = 4
}
type TaskOptions = Omit<Task, 'key' | 'status'>;
export default class Concurrency {
    private tasks;
    private threshold;
    constructor(options?: ConcurrencyOptions);
    /**
     * add task to prepare execute
     * @param options
     */
    addTask(options: TaskOptions): void;
    /**
     * add task and try execute
     * @param options
     */
    addAndFlushTasks(options: TaskOptions): Promise<unknown>;
    /**
     * to execute tasks
     */
    execute(): Promise<unknown>;
    clear(): void;
    /**
     * The smaller the value of the priority attribute, the higher the priority.
     * @param options
     * @private
     */
    private createTask;
    private runTask;
    private flushTasks;
    private getHighestPriorityWaitTask;
    private minBy;
}
export {};
