export class CompressWorkerController {
    callBackMap: Record<number, (result: any) => void>;
    id: number;
    workers: Worker[];
    constructor(number = 1) {
        const workers = (new Array(number)).fill(new URL("../workers/compressWorker.ts", import.meta.url).href).map(url => new Worker(url, { type: 'module' }));
        this.id = 0;
        this.callBackMap = {};
        workers.forEach(worker => {
        worker.addEventListener('message', event => {
            const { id, result } = event.data;
            this.callBackMap[id](result);
        });
        });
        this.workers = workers;
    }

    compress(data: Transferable): Promise<string | ArrayBuffer> {
        return new Promise(resolve => {
            const id = this.id++;
            this.callBackMap[id] = resolve;
            const index = id % this.workers.length;
            const worker = this.workers[index];
            worker.postMessage({ id, data });
        });
    }

    destroy() {
        this.workers.forEach(worker => worker.terminate());
    }
}