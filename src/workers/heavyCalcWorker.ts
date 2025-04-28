import { heavyCalculation } from "@/lib/utils";

//web worker to calculate Fibonacci numbers
self.onmessage = function (e) {
    const ans = heavyCalculation(e.data);
    self.postMessage(ans);
}