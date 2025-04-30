//example to compress image
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { compressFile, sleep } from "@/lib/utils";
import { CompressWorkerController } from "@/workerController/CompressWorkerController";
import { useState } from "react";

export default function CompressImage() {
    const [imageCount, setImageCount] = useState<number>(20);
    const [workerCount, setWorkerCount] = useState<number>(4);
    const [mainThreadProgress, setMainThreadProgress] = useState<number>(0);
    const [workerThreadProgress, setWorkerThreadProgress] = useState<number>(0);

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
        const files = await Promise.all(new Array(count).fill(0).map(async (_, index) => {
            const response = await fetch(`https://picsum.photos/id/${index}/4096/2160`);
            const blob = await response.blob();
            return new File([blob], `image-${index}.jpg`, { type: "image/jpeg" });
        }));
        return files;
    }

    const test = async () => {
        const workerController = new CompressWorkerController(workerCount);
        setMainThreadProgress(0);
        setWorkerThreadProgress(0);

        try {
            const imageFiles = await getImageFiles(imageCount);

            const [arrayBuffersForMain, arrayBuffersForWorker] = await Promise.all([
                getImageArrayBuffersFromFiles(imageFiles),
                getImageArrayBuffersFromFiles(imageFiles),
            ]);

            let finishedCountForWorker = 0;
            let finishedCountForMain = 0;

            const workerPromise = Promise.all(
                arrayBuffersForWorker.map(async (arrayBuffer) => {
                    await workerController.compress(arrayBuffer);
                    finishedCountForWorker++;
                    setWorkerThreadProgress(
                        Math.round((finishedCountForWorker / imageCount) * 100)
                    );
                })
            );

            for (const arrayBuffer of arrayBuffersForMain) {
                await compressFile(arrayBuffer);
                finishedCountForMain++;
                setMainThreadProgress(
                    Math.round((finishedCountForMain / imageCount) * 100)
                );
            }

            await workerPromise;
        } catch (error) {
            console.error("Error during compression:", error);
        } finally {
            workerController.destroy();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold">Compress Image</h1>
            <div >
                <p className="text-gray-500">Compress images using web workers</p>
                <p className="text-gray-500">Number of 4k images:</p>
                <Input value={imageCount} onChange={onImageCountChange} />
                <p className="text-gray-500">Number of workers:</p>
                <Input value={workerCount} onChange={onWorkerCountChange} />
            </div>
            <div >
                <button className="text-black" onClick={test}>Compress</button>
            </div>
            <div >
                <h2 className="text-xl font-bold">Progress</h2>
                <p className="text-gray-500">Main thread progress:</p>
                <Progress className="w-[700px]" value={mainThreadProgress} />
                <p className="text-gray-500">Worker thread progress:</p>
                <Progress className="w-[700px]" value={workerThreadProgress} />
            </div>
        </div>
    );
}