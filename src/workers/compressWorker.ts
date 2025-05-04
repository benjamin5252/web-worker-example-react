
import { compressFile } from '@/lib/utils';
import { OneTaskQueue } from '../lib/OneTaskQueue';

export interface CompressWorkerMessage {
  id: string;
  data: string | ArrayBuffer;
}

const queue = new OneTaskQueue();

self.addEventListener('message', (event) => {
  const { id, data } = event.data;
  queue.enqueue(async () => {
    const result = await compressFile(data);
    self.postMessage({ id, result });
  });
});