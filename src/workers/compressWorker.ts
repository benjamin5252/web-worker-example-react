
import { compressFile } from '@/lib/utils';

export interface CompressWorkerMessage {
  id: string;
  data: string | ArrayBuffer;
}

self.addEventListener('message', async (event) => {
  const { id, data } = event.data;
  const result = await compressFile(data);
  self.postMessage({ id, result });
});