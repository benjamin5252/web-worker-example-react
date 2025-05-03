//example to compress image
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { compressFile } from "@/lib/utils";
import { CompressWorkerController } from "@/workerController/CompressWorkerController";
import { useState } from "react";

export default function CompressImagePage() {
    const [imageCount, setImageCount] = useState<number>(20);
    const [workerCount, setWorkerCount] = useState<number>(4);
    const [mainThreadProgress, setMainThreadProgress] = useState<number>(0);
    const [workerThreadProgress, setWorkerThreadProgress] = useState<number>(0);
    const [mainThreadTime, setMainThreadTime] = useState<number | null>(null);
    const [workerThreadTime, setWorkerThreadTime] = useState<number | null>(null);
    const [imageDownloadCount, setImageDownloadCount] = useState<number>(0);

    const onImageCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "") {
            setImageCount(0);
        } else {
            const num = parseInt(value, 10);
            if (!isNaN(num)) {
                setImageCount(num);
            }
        }
    }

    const onWorkerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "") {
            setWorkerCount(0);
        } else {
            const num = parseInt(value, 10);
            if (!isNaN(num)) {
                setWorkerCount(num);
            }
        }
    }

    const getImageArrayBuffersFromFiles = async (files: File[]) => {
        const arrayBuffers = await Promise.all(files.map(async (file) => {
            const response = await fetch(URL.createObjectURL(file));
            const blob = await response.blob();
            return new Response(blob).arrayBuffer();
        }));
        return arrayBuffers;
    }
    
    const getImageFiles = async (count: number) => {
        let downloadCount = 0;
        setImageDownloadCount(0)
        const files = await Promise.all(new Array(count).fill(0).map(async (_, index) => {
            const urlIndex = index % 30;
            const response = await fetch(`https://picsum.photos/id/${urlIndex}/4096/2160`);
            const blob = await response.blob();
            downloadCount ++;
            setImageDownloadCount(downloadCount)
            return new File([blob], `image-${index}.jpg`, { type: "image/jpeg" });
        }));
        return files;
    }

    const compressInMainThread = async (arrayBuffers: ArrayBuffer[]) => {
        const startTime = performance.now();
        let finishedCountForMain = 0;
        for (const arrayBuffer of arrayBuffers) {
            await compressFile(arrayBuffer);
            finishedCountForMain++;
            setMainThreadProgress(
                Math.round((finishedCountForMain / imageCount) * 100)
            );
        }
        const endTime = performance.now();
        setMainThreadTime(endTime - startTime);
    };

    const compressInWorkerThread = async (arrayBuffers: ArrayBuffer[]) => {
        const workerController = new CompressWorkerController(workerCount);
        const startTime = performance.now();
        let finishedCountForWorker = 0;
        try {
            await Promise.all(
                arrayBuffers.map(async (arrayBuffer) => {
                    await workerController.compress(arrayBuffer);
                    finishedCountForWorker++;
                    setWorkerThreadProgress(
                        Math.round((finishedCountForWorker / imageCount) * 100)
                    );
                })
            );
        } finally {
            workerController.destroy();
        }
        const endTime = performance.now();
        setWorkerThreadTime(endTime - startTime);
    };

    const test = async () => {
        setMainThreadProgress(0);
        setWorkerThreadProgress(0);
        setMainThreadTime(null);
        setWorkerThreadTime(null);

        try {
            const imageFiles = await getImageFiles(imageCount);

            const [arrayBuffersForMain, arrayBuffersForWorker] = await Promise.all([
                getImageArrayBuffersFromFiles(imageFiles),
                getImageArrayBuffersFromFiles(imageFiles),
            ]);

            await Promise.all([
                compressInMainThread(arrayBuffersForMain),
                compressInWorkerThread(arrayBuffersForWorker),
            ]);
        } catch (error) {
            console.error("Error during compression:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold text-center">Compress Image</h1>
            <div >
                <p className="text-gray-500">Compress images using web workers</p>
                <p className="text-gray-500">Number of 4k images:</p>
                <Input value={imageCount} onChange={onImageCountChange} />
                <p className="text-gray-500">Number of workers:</p>
                <Input value={workerCount} onChange={onWorkerCountChange} />
            </div>
            <div >
                <Button onClick={test}>Compress</Button>
            </div>
            <div >
                <div>Image download: {imageDownloadCount} / {imageCount}</div>
                <br/>
                {/* <h2 className="text-xl font-bold">Progress</h2> */}
                <p className="font-bold">Main thread progress:</p>
                <p className="text-gray-500">Time taken: {mainThreadTime !== null ? `${mainThreadTime.toFixed(2)} ms` : ""}</p>
                <Progress className="w-[700px] max-w-[100vw]" value={mainThreadProgress} />
                <br />
                <p className="font-bold">Worker thread progress:</p>
                <p className="text-gray-500">Time taken: {workerThreadTime !== null ? `${workerThreadTime.toFixed(2)} ms` : ""}</p>
                <Progress className="w-[700px] max-w-[100vw]" value={workerThreadProgress} />
            </div>
        </div>
    );
}