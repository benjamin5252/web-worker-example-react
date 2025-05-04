type Task = () => Promise<void>;

export class OneTaskQueue {
  private queue: Task[] = [];
  private running = false;

  enqueue(task: Task) {
    this.queue.push(task);
    this.runNext();
  }

  private async runNext() {
    if (this.running || this.queue.length === 0) return;

    this.running = true;
    const task = this.queue.shift()!;
    try {
      await task();
    } finally {
      this.running = false;
      this.runNext();
    }
  }
}