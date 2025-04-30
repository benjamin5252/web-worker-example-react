// example to show web worker preventing the main thread from freezing
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input"
import { heavyCalculation } from "@/lib/utils";
import sonic from "@/assets/sonic.gif";

export default function PageFreezePage() {
    const [input, setInput] = useState<number>(2);
    const [records, setRecords] = useState<string[]>([]);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => (prev + 1) % 100);
        }, 100);
        return () => clearInterval(interval);
    }, []);


    function heavyCalcMainThread(n: number) {
        const ans = heavyCalculation(n);
        return ans;
    }

    function heavyCalcWorker(n: number): Promise<number> {
        return new Promise((resolve) => {
            const worker = new Worker(new URL("../workers/heavyCalcWorker.ts", import.meta.url), { type: "module" });
            worker.onmessage = function (e) {
                resolve(e.data);
                worker.terminate();
            };
            worker.postMessage(n);
        })
    }

    async function calc(type: "main" | "worker") {
        let sum = 0;
        const n = input * 1000_000_000;
        if (type === "main") {
            sum = heavyCalcMainThread(n);
        } else {
            sum = await heavyCalcWorker(n);
        }
        setRecords([...records, `sum from 0 to ${input} is ${sum} (${type})`]);
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        if (value === "") {
            setInput(0);
        } else {
            const num = parseInt(value, 10);
            if (!isNaN(num)) {
                setInput(num);
            }
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="flex flex-row items-center justify-center gap-4 h-fit">
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-black">JS controled</p>
                    <Progress className="w-[100px]" value={progress} />
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-black">CSS animation</p>
                    <div className="bg-black w-[100px] h-[100px] animate-pulse">
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-black">CSS animation</p>
                    <div role="status">
                        <svg aria-hidden="true" className="w-[80px] h-[80px] text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-black">GIF</p>
                    <img className="w-[100px] h-[100px]" src={sonic} />
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-black">Scroll</p>
                    <div className="w-[120px] h-[120px] overflow-y-scroll">
                        <p className="text-black">This is a test to show how web worker can prevent the main thread from freezing. The main thread will be blocked for a while when the calculation is done on the main thread. But when the calculation is done on the web worker, the main thread will not be blocked.</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center mt-4 gap-4">
                <div>
                    Sum from 0 to: <Input value={input} onChange={onInputChange} /> * 10^9
                </div>
                <div className="flex flex-row items-center justify-center mt-4 gap-4">
                    <Button onClick={() => calc("main")} className="text-black">Calc on Main thread</Button>
                    <Button onClick={() => calc("worker")} className="text-black">Calc on Worker</Button>
                </div>
            </div>
            <div className="mt-4 flex flex-col items-center justify-center">
                {
                    records.map((record, index) => {
                        return (
                            <div key={index} className="flex flex-col items-center justify-center">
                                <p>{record}</p>
                            </div>
                        )
                    })
                }
            </div>

        </div>
    );
}