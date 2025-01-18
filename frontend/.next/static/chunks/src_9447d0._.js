(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_9447d0._.js", {

"[project]/src/services/crypto.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
// // First, let's define our types at the top
// type CryptoCurrency = 'BTC' | 'ETH' | 'LTC' | 'TRON' | 'MONERO';
// export interface CryptoPayment {
//   address: string;
//   amount: number;
//   currency: CryptoCurrency;
//   orderId: string;
//   status: 'pending' | 'completed' | 'failed';
//   timeoutAt: number;
// }
// interface TransactionResult {
//   success: boolean;
//   transactionHash?: string;
//   error?: string;
// }
// // Define our static data with proper typing
// const CRYPTO_ADDRESSES: Record<CryptoCurrency, string> = {
//   BTC: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
//   ETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
//   LTC: 'LbTjMGN7gELw4KbeyQf6cTCq5oxkhtHGKz',
//   TRON: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
//   MONERO: '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A'
// };
// const MINIMUM_PAYMENTS: Record<CryptoCurrency, number> = {
//   BTC: 0.0001,
//   ETH: 0.01,
//   LTC: 0.1,
//   TRON: 100,
//   MONERO: 0.1
// };
// // In-memory storage
// const payments = new Map<string, CryptoPayment>();
// function generateWalletAddress(currency: CryptoCurrency): string {
//   return CRYPTO_ADDRESSES[currency];
// }
// export async function createCryptoPayment(currency: CryptoCurrency, amount: number): Promise<CryptoPayment> {
//   const payment: CryptoPayment = {
//     address: generateWalletAddress(currency),
//     amount,
//     currency,
//     orderId: `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`,
//     status: 'pending',
//     timeoutAt: Date.now() + 30 * 60 * 1000
//   };
//   payments.set(payment.orderId, payment);
//   startPaymentMonitoring(payment);
//   return payment;
// }
// export async function checkPaymentStatus(orderId: string): Promise<'pending' | 'completed' | 'failed'> {
//   const payment = payments.get(orderId);
//   if (!payment) {
//     throw new Error('Payment not found');
//   }
//   if (Date.now() > payment.timeoutAt && payment.status === 'pending') {
//     payment.status = 'failed';
//     payments.set(orderId, payment);
//   }
//   return payment.status;
// }
// async function startPaymentMonitoring(payment: CryptoPayment): Promise<void> {
//   const checkInterval = setInterval(async () => {
//     try {
//       const result = await checkBlockchain(payment);
//       if (result.success) {
//         payment.status = 'completed';
//         payments.set(payment.orderId, payment);
//         clearInterval(checkInterval);
//       }
//       if (Date.now() > payment.timeoutAt) {
//         payment.status = 'failed';
//         payments.set(payment.orderId, payment);
//         clearInterval(checkInterval);
//       }
//     } catch (error) {
//       console.error('Payment monitoring error:', error);
//     }
//   }, 10000);
// }
// async function checkBlockchain(payment: CryptoPayment): Promise<TransactionResult> {
//   if (Math.random() < 0.1) {
//     return {
//       success: true,
//       transactionHash: `0x${Math.random().toString(36).substring(7)}`
//     };
//   }
//   return { success: false };
// }
// export async function validateAddress(currency: CryptoCurrency, address: string): Promise<boolean> {
//   return true;
// }
// export function getMinimumPayment(currency: CryptoCurrency): number {
//   return MINIMUM_PAYMENTS[currency];
// }
// export function formatCryptoAmount(amount: number, currency: CryptoCurrency): string {
//   return `${amount.toFixed(8)} ${currency}`;
// }
// // Export types for use in other files
// export type { CryptoCurrency };
__turbopack_esm__({
    "checkPaymentStatus": (()=>checkPaymentStatus)
});
async function checkPaymentStatus(orderId) {
    const response = await fetch(`http://localhost:5000/payment/check/${orderId}`);
    const data = await response.json();
    console.log("🚀 ~ checkPaymentStatus ~ data:", data);
    return data.status;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/PaymentMonitor.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
// // src/components/PaymentMonitor.tsx
// 'use client';
// import { useState, useEffect } from 'react';
// import { CryptoPayment, checkPaymentStatus, formatCryptoAmount } from '@/services/crypto'
// interface PaymentMonitorProps {
//   payment: CryptoPayment;
//   onSuccess: () => void;
//   onFailure: () => void;
// }
// export default function PaymentMonitor({ payment, onSuccess, onFailure }: PaymentMonitorProps) {
//   const [timeLeft, setTimeLeft] = useState<number>(
//     Math.max(0, payment.timeoutAt - Date.now())
//   );
//   useEffect(() => {
//     const timer = setInterval(() => {
//       const newTimeLeft = Math.max(0, payment.timeoutAt - Date.now());
//       setTimeLeft(newTimeLeft);
//       if (newTimeLeft === 0) {
//         onFailure();
//         clearInterval(timer);
//       }
//     }, 1000);
//     const statusChecker = setInterval(async () => {
//       try {
//         const status = await checkPaymentStatus(payment.orderId);
//         if (status === 'completed') {
//           onSuccess();
//           clearInterval(statusChecker);
//           clearInterval(timer);
//         } else if (status === 'failed') {
//           onFailure();
//           clearInterval(statusChecker);
//           clearInterval(timer);
//         }
//       } catch (error) {
//         console.error('Error checking payment status:', error);
//       }
//     }, 5000);
//     return () => {
//       clearInterval(timer);
//       clearInterval(statusChecker);
//     };
//   }, [payment, onSuccess, onFailure]);
//   const minutes = Math.floor(timeLeft / 60000);
//   const seconds = Math.floor((timeLeft % 60000) / 1000);
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-lg">
//       <h3 className="text-xl font-bold mb-4">Payment Details</h3>
//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm text-gray-600">Send exactly:</label>
//           <p className="text-2xl font-bold">{payment.amount} {payment.currency}</p>
//         </div>
//         <div>
//           <label className="block text-sm text-gray-600">To address:</label>
//           <div className="flex items-center gap-2">
//             <input
//               type="text"
//               value={payment.address}
//               readOnly
//               className="w-full p-2 bg-gray-50 rounded border"
//             />
//             <button
//               onClick={() => navigator.clipboard.writeText(payment.address)}
//               className="p-2 text-blue-600 hover:text-blue-700"
//             >
//               Copy
//             </button>
//           </div>
//         </div>
//         <div>
//           <label className="block text-sm text-gray-600">Time remaining:</label>
//           <p className="text-xl">
//             {minutes}:{seconds.toString().padStart(2, '0')}
//           </p>
//         </div>
//         <div className="mt-4 pt-4 border-t">
//           <div className="flex items-center gap-2">
//             <div className={`w-3 h-3 rounded-full ${
//               payment.status === 'pending' ? 'bg-yellow-500' :
//               payment.status === 'completed' ? 'bg-green-500' :
//               'bg-red-500'
//             }`} />
//             <span className="capitalize">{payment.status}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// 'use client';
// import { useState, useEffect } from 'react';
// import { CryptoPayment, checkPaymentStatus } from '@/services/crypto';
// interface PaymentMonitorProps {
//   payment: CryptoPayment;
//   onSuccess: () => void;
//   onFailure: () => void;
// }
// export default function PaymentMonitor({ payment, onSuccess, onFailure }: PaymentMonitorProps) {
//   const [timeLeft, setTimeLeft] = useState<number>(
//     Math.max(0, payment.timeoutAt - Date.now())
//   );
//   const [status, setStatus] = useState<'pending' | 'confirming' | 'completed'>('pending');
//   const [confirmations, setConfirmations] = useState(0);
//   useEffect(() => {
//     // Countdown timer
//     const timer = setInterval(() => {
//       const newTimeLeft = Math.max(0, payment.timeoutAt - Date.now());
//       setTimeLeft(newTimeLeft);
//       if (newTimeLeft === 0) {
//         onFailure();
//         clearInterval(timer);
//       }
//     }, 1000);
//     // Payment status checker
//     const statusChecker = setInterval(async () => {
//       try {
//         const paymentStatus = await checkPaymentStatus(payment.orderId);
//         console.log("🚀 ~ statusChecker ~ paymentStatus:", paymentStatus)
//         if (paymentStatus === 'completed') {
//           setStatus('completed');
//           clearInterval(statusChecker);
//           clearInterval(timer);
//           onSuccess();
//         } else if (paymentStatus === 'confirming') {
//           setStatus('confirming');
//           setConfirmations(prev => prev + 1);
//         }
//       } catch (error) {
//         console.error('Payment check failed:', error);
//       }
//     }, 5000); // Check every 5 seconds
//     return () => {
//       clearInterval(timer);
//       clearInterval(statusChecker);
//     };
//   }, [payment.orderId, payment.timeoutAt, onSuccess, onFailure]);
//   const minutes = Math.floor(timeLeft / 60000);
//   const seconds = Math.floor((timeLeft % 60000) / 1000);
//   return (
//     <div className="space-y-4">
//       <div>
//         <label className="block text-sm text-gray-600 mb-1">Time Remaining:</label>
//         <div className="text-2xl font-mono">
//           {minutes}:{seconds.toString().padStart(2, '0')}
//         </div>
//       </div>
//       <div className="flex items-center gap-2">
//         <div className={`w-3 h-3 rounded-full ${
//           status === 'completed' ? 'bg-green-500' :
//           status === 'confirming' ? 'bg-blue-500 animate-pulse' :
//           'bg-yellow-500 animate-pulse'
//         }`} />
//         <span className="font-medium">
//           {status === 'completed' ? 'Payment Confirmed!' :
//            status === 'confirming' ? `Confirming (${confirmations} confirmations)` :
//            'Awaiting Payment...'}
//         </span>
//       </div>
//     </div>
//   );
// }
__turbopack_esm__({
    "default": (()=>PaymentMonitor)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$crypto$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/services/crypto.ts [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
'use client';
;
;
function PaymentMonitor({ payment, onSuccess, onFailure }) {
    _s();
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(Math.max(0, payment.timeoutAt - Date.now()));
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('pending');
    const [confirmations, setConfirmations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PaymentMonitor.useEffect": ()=>{
            // Countdown timer
            const timer = setInterval({
                "PaymentMonitor.useEffect.timer": ()=>{
                    const newTimeLeft = Math.max(0, payment.timeoutAt - Date.now());
                    setTimeLeft(newTimeLeft);
                    if (newTimeLeft === 0) {
                        onFailure();
                        clearInterval(timer);
                    }
                }
            }["PaymentMonitor.useEffect.timer"], 1000);
            // Payment status checker
            const statusChecker = setInterval({
                "PaymentMonitor.useEffect.statusChecker": async ()=>{
                    try {
                        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$crypto$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkPaymentStatus"])(payment.orderId);
                        const { status, txHash, downloadLink } = response;
                        if (status === 'completed') {
                            setStatus('completed');
                            clearInterval(statusChecker);
                            clearInterval(timer);
                            onSuccess(txHash, downloadLink);
                        } else if (status === 'confirming') {
                            setStatus('confirming');
                            setConfirmations({
                                "PaymentMonitor.useEffect.statusChecker": (prev)=>prev + 1
                            }["PaymentMonitor.useEffect.statusChecker"]);
                        }
                    } catch (error) {
                        console.error('Payment check failed:', error);
                    }
                }
            }["PaymentMonitor.useEffect.statusChecker"], 5000); // Check every 5 seconds
            return ({
                "PaymentMonitor.useEffect": ()=>{
                    clearInterval(timer);
                    clearInterval(statusChecker);
                }
            })["PaymentMonitor.useEffect"];
        }
    }["PaymentMonitor.useEffect"], [
        payment.orderId,
        payment.timeoutAt,
        onSuccess,
        onFailure
    ]);
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor(timeLeft % 60000 / 1000);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-sm text-gray-600 mb-1",
                        children: "Time Remaining:"
                    }, void 0, false, {
                        fileName: "[project]/src/components/PaymentMonitor.tsx",
                        lineNumber: 253,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-2xl font-mono",
                        children: [
                            minutes,
                            ":",
                            seconds.toString().padStart(2, '0')
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/PaymentMonitor.tsx",
                        lineNumber: 254,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/PaymentMonitor.tsx",
                lineNumber: 252,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `w-3 h-3 rounded-full ${status === 'completed' ? 'bg-green-500' : status === 'confirming' ? 'bg-blue-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`
                    }, void 0, false, {
                        fileName: "[project]/src/components/PaymentMonitor.tsx",
                        lineNumber: 260,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-medium",
                        children: status === 'completed' ? 'Payment Confirmed!' : status === 'confirming' ? `Confirming (${confirmations} confirmations)` : 'Awaiting Payment...'
                    }, void 0, false, {
                        fileName: "[project]/src/components/PaymentMonitor.tsx",
                        lineNumber: 265,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/PaymentMonitor.tsx",
                lineNumber: 259,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/PaymentMonitor.tsx",
        lineNumber: 251,
        columnNumber: 5
    }, this);
}
_s(PaymentMonitor, "xw4PP7DrGHFMO7ierl0qL3qOpRM=");
_c = PaymentMonitor;
var _c;
__turbopack_refresh__.register(_c, "PaymentMonitor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/CryptoPayment.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
// // import { useState, useEffect } from 'react';
// // import QRCode from 'qr-code-styling';
// // import { useRouter } from 'next/navigation';
// // interface CryptoPaymentProps {
// //   orderId: string;
// //   currency: string;
// //   address: string;
// //   amount: number;
// //   expiresIn: number; // in seconds
// // }
// // export default function CryptoPayment({ orderId, currency, address, amount, expiresIn }: CryptoPaymentProps) {
// //   const [timeLeft, setTimeLeft] = useState(expiresIn);
// //   const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
// //   const router = useRouter();
// //   useEffect(() => {
// //     // Generate QR Code
// //     const qr = new QRCode({
// //       width: 300,
// //       height: 300,
// //       data: `${currency.toLowerCase()}:${address}?amount=${amount}`,
// //       dotsOptions: { color: '#2563eb', type: 'rounded' },
// //       backgroundOptions: { color: '#ffffff' },
// //       imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 }
// //     });
// //     const container = document.getElementById('qrcode');
// //     if (container) {
// //       container.innerHTML = '';
// //       qr.append(container);
// //     }
// //     // Start countdown timer
// //     const timer = setInterval(() => {
// //       setTimeLeft(prev => {
// //         if (prev <= 1) {
// //           clearInterval(timer);
// //           return 0;
// //         }
// //         return prev - 1;
// //       });
// //     }, 1000);
// //     // Check payment status
// //     const checkStatus = setInterval(async () => {
// //       try {
// //         const response = await fetch(`/api/payments/status/${orderId}`);
// //         const data = await response.json();
// //         if (data.status === 'completed') {
// //           setStatus('completed');
// //           clearInterval(checkStatus);
// //           setTimeout(() => {
// //             router.push(`/download?token=${data.downloadToken}`);
// //           }, 3000);
// //         }
// //       } catch (error) {
// //         console.error('Failed to check payment status:', error);
// //       }
// //     }, 10000);
// //     return () => {
// //       clearInterval(timer);
// //       clearInterval(checkStatus);
// //     };
// //   }, [orderId, currency, address, amount]);
// //   const minutes = Math.floor(timeLeft / 60);
// //   const seconds = timeLeft % 60;
// //   return (
// //     <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
// //       <div className="text-center mb-6">
// //         <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
// //         <p className="text-gray-600">Send exactly {amount} {currency}</p>
// //       </div>
// //       {/* QR Code */}
// //       <div className="bg-gray-50 p-4 rounded-lg mb-6">
// //         <div id="qrcode" className="flex justify-center" />
// //       </div>
// //       {/* Payment Details */}
// //       <div className="space-y-4">
// //         <div>
// //           <label className="block text-sm text-gray-600">Send To Address:</label>
// //           <div className="flex items-center gap-2">
// //             <input
// //               type="text"
// //               value={address}
// //               readOnly
// //               className="w-full p-2 bg-gray-50 rounded border font-mono text-sm"
// //             />
// //             <button
// //               onClick={() => navigator.clipboard.writeText(address)}
// //               className="p-2 text-blue-600 hover:text-blue-700"
// //             >
// //               Copy
// //             </button>
// //           </div>
// //         </div>
// //         {/* Timer */}
// //         <div className="flex items-center justify-between">
// //           <span className="text-sm text-gray-600">Time Remaining:</span>
// //           <span className="font-mono text-lg">
// //             {minutes}:{seconds.toString().padStart(2, '0')}
// //           </span>
// //         </div>
// //         {/* Status */}
// //         <div className="flex items-center gap-2 mt-4">
// //           <div className={`w-2 h-2 rounded-full ${
// //             status === 'pending' ? 'bg-yellow-400' :
// //             status === 'completed' ? 'bg-green-400' : 'bg-red-400'
// //           }`} />
// //           <span className="text-sm text-gray-600">
// //             {status === 'pending' ? 'Waiting for payment...' :
// //              status === 'completed' ? 'Payment confirmed!' : 'Payment failed'}
// //           </span>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import QRCode from 'qr-code-styling';
// import PaymentMonitor from './PaymentMonitor';
// interface CryptoPaymentProps {
//   orderId: string;
//   currency: string;
//   address: string;
//   amount: number;
//   expiresIn: number;
// }
// export default function CryptoPayment({ 
//   orderId, 
//   currency, 
//   address, 
//   amount, 
//   expiresIn 
// }: CryptoPaymentProps) {
//   const router = useRouter();
//   const [copied, setCopied] = useState(false);
//   const qrRef = useRef<QRCode | null>(null);
//   useEffect(() => {
//     // Clear any existing QR code
//     const qrContainer = document.getElementById('qrcode');
//     if (qrContainer) {
//       qrContainer.innerHTML = '';
//     }
//     // Ensure address and amount are properly formatted
//     const formattedAddress = address.replace(/\s+/g, '');
//     const formattedAmount = amount.toFixed(8);
//     // Create new QR code
//     qrRef.current = new QRCode({
//       width: 300,
//       height: 300,
//       data: `${currency.toLowerCase()}:${formattedAddress}?amount=${formattedAmount}`,
//       dotsOptions: { color: '#2563eb', type: 'rounded' },
//       backgroundOptions: { color: '#ffffff' },
//     });
//     qrRef.current.append(qrContainer!);
//     // Cleanup on unmount
//     return () => {
//       if (qrContainer) {
//         qrContainer.innerHTML = '';
//       }
//     };
//   }, [address, amount, currency]);
//   const payment = {
//     orderId,
//     currency,
//     address,
//     amount,
//     status: 'pending' as const,
//     timeoutAt: Date.now() + (expiresIn * 1000)
//   };
//   const handleSuccess = () => {
//     router.push('/download');
//   };
//   const handleFailure = () => {
//     router.push('/payments/status?error=failed');
//   };
//   const copyToClipboard = async () => {
//     await navigator.clipboard.writeText(address);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };
//   return (
//     <div className="max-w-xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
//           <h1 className="text-2xl font-bold text-center">Complete Your Payment</h1>
//           <p className="text-center opacity-90 mt-1">
//             Send exactly {amount} {currency}
//           </p>
//         </div>
//         {/* QR Code */}
//         <div className="p-8">
//           <div className="bg-gray-50 p-6 rounded-xl flex justify-center mb-6">
//             <div id="qrcode" />
//           </div>
//           {/* Payment Details */}
//           <div className="space-y-6">
//             <div>
//               <label className="block text-sm text-gray-600 mb-2">
//                 Send Payment To:
//               </label>
//               <div className="flex items-center gap-2">
//                 <input
//                   type="text"
//                   value={address}
//                   readOnly
//                   className="w-full p-3 bg-gray-50 rounded-lg border font-mono text-sm"
//                 />
//                 <button
//                   onClick={copyToClipboard}
//                   className="p-2.5 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-50"
//                 >
//                   {copied ? (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                   ) : (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//             </div>
//             <PaymentMonitor
//               payment={payment}
//               onSuccess={handleSuccess}
//               onFailure={handleFailure}
//             />
//           </div>
//         </div>
//         {/* Instructions */}
//         <div className="border-t bg-gray-50 p-6">
//           <h3 className="font-medium mb-3">Payment Instructions:</h3>
//           <ol className="space-y-2 text-sm text-gray-600">
//             <li>1. Copy the address or scan the QR code</li>
//             <li>2. Send exactly {amount} {currency}</li>
//             <li>3. Wait for confirmation (~10-30 mins)</li>
//             <li>4. You'll be redirected automatically</li>
//           </ol>
//         </div>
//       </div>
//     </div>
//   );
// }
__turbopack_esm__({
    "default": (()=>CryptoPayment)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$qr$2d$code$2d$styling$2f$lib$2f$qr$2d$code$2d$styling$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/qr-code-styling/lib/qr-code-styling.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PaymentMonitor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/components/PaymentMonitor.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
'use client';
;
;
;
;
function CryptoPayment({ orderId, currency, address, amount, expiresIn }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const qrRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CryptoPayment.useEffect": ()=>{
            // Clear any existing QR code
            const qrContainer = document.getElementById('qrcode');
            if (qrContainer) {
                qrContainer.innerHTML = '';
            }
            // Ensure address and amount are properly formatted
            const formattedAddress = address.replace(/\s+/g, '');
            const formattedAmount = amount.toFixed(8);
            // Create new QR code
            qrRef.current = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$qr$2d$code$2d$styling$2f$lib$2f$qr$2d$code$2d$styling$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
                width: 300,
                height: 300,
                data: `bitcoin:${formattedAddress}?amount=${formattedAmount}`,
                dotsOptions: {
                    color: '#2563eb',
                    type: 'rounded'
                },
                backgroundOptions: {
                    color: '#ffffff'
                }
            });
            qrRef.current.append(qrContainer);
            // Cleanup on unmount
            return ({
                "CryptoPayment.useEffect": ()=>{
                    if (qrContainer) {
                        qrContainer.innerHTML = '';
                    }
                }
            })["CryptoPayment.useEffect"];
        }
    }["CryptoPayment.useEffect"], [
        address,
        amount,
        currency
    ]);
    const payment = {
        orderId,
        currency,
        address,
        amount,
        status: 'pending',
        timeoutAt: Date.now() + expiresIn * 1000
    };
    const handleSuccess = ()=>{
        router.push('/download');
    };
    const handleFailure = ()=>{
        router.push('/payments/status?error=failed');
    };
    const copyToClipboard = async ()=>{
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(()=>setCopied(false), 2000);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-xl mx-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-2xl shadow-xl overflow-hidden",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-2xl font-bold text-center",
                            children: "Complete Your Payment"
                        }, void 0, false, {
                            fileName: "[project]/src/components/CryptoPayment.tsx",
                            lineNumber: 360,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-center opacity-90 mt-1",
                            children: [
                                "Send exactly ",
                                amount,
                                " ",
                                currency
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/CryptoPayment.tsx",
                            lineNumber: 361,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/CryptoPayment.tsx",
                    lineNumber: 359,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-50 p-6 rounded-xl flex justify-center mb-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                id: "qrcode"
                            }, void 0, false, {
                                fileName: "[project]/src/components/CryptoPayment.tsx",
                                lineNumber: 369,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/CryptoPayment.tsx",
                            lineNumber: 368,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm text-gray-600 mb-2",
                                            children: "Send Payment To:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/CryptoPayment.tsx",
                                            lineNumber: 375,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: address,
                                                    readOnly: true,
                                                    className: "w-full p-3 bg-gray-50 rounded-lg border font-mono text-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CryptoPayment.tsx",
                                                    lineNumber: 379,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: copyToClipboard,
                                                    className: "p-2.5 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-50",
                                                    children: copied ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "w-5 h-5",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            strokeWidth: 2,
                                                            d: "M5 13l4 4L19 7"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/CryptoPayment.tsx",
                                                            lineNumber: 391,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/CryptoPayment.tsx",
                                                        lineNumber: 390,
                                                        columnNumber: 21
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "w-5 h-5",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            strokeWidth: 2,
                                                            d: "M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/CryptoPayment.tsx",
                                                            lineNumber: 395,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/CryptoPayment.tsx",
                                                        lineNumber: 394,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/CryptoPayment.tsx",
                                                    lineNumber: 385,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/CryptoPayment.tsx",
                                            lineNumber: 378,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/CryptoPayment.tsx",
                                    lineNumber: 374,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PaymentMonitor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    payment: payment,
                                    onSuccess: handleSuccess,
                                    onFailure: handleFailure
                                }, void 0, false, {
                                    fileName: "[project]/src/components/CryptoPayment.tsx",
                                    lineNumber: 402,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/CryptoPayment.tsx",
                            lineNumber: 373,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/CryptoPayment.tsx",
                    lineNumber: 367,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border-t bg-gray-50 p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "font-medium mb-3",
                            children: "Payment Instructions:"
                        }, void 0, false, {
                            fileName: "[project]/src/components/CryptoPayment.tsx",
                            lineNumber: 412,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                            className: "space-y-2 text-sm text-gray-600",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "1. Copy the address or scan the QR code"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/CryptoPayment.tsx",
                                    lineNumber: 414,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: [
                                        "2. Send exactly ",
                                        amount,
                                        " ",
                                        currency
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/CryptoPayment.tsx",
                                    lineNumber: 415,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "3. Wait for confirmation (~10-30 mins)"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/CryptoPayment.tsx",
                                    lineNumber: 416,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "4. You'll be redirected automatically"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/CryptoPayment.tsx",
                                    lineNumber: 417,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/CryptoPayment.tsx",
                            lineNumber: 413,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/CryptoPayment.tsx",
                    lineNumber: 411,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/CryptoPayment.tsx",
            lineNumber: 357,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/CryptoPayment.tsx",
        lineNumber: 356,
        columnNumber: 5
    }, this);
}
_s(CryptoPayment, "TR8LN2iwtfgqhPgMplgCnGgz6zo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = CryptoPayment;
var _c;
__turbopack_refresh__.register(_c, "CryptoPayment");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/payments/process/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>PaymentProcessPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CryptoPayment$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/components/CryptoPayment.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
'use client';
;
;
function PaymentProcessPage() {
    _s();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const orderId = searchParams.get('orderId') || '';
    const currency = searchParams.get('currency') || '';
    const address = searchParams.get('address') || '';
    const amount = parseFloat(searchParams.get('amount') || '0');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 py-12",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$CryptoPayment$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            orderId: orderId,
            currency: currency,
            address: address,
            amount: amount,
            expiresIn: 1800
        }, void 0, false, {
            fileName: "[project]/src/app/payments/process/page.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/payments/process/page.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_s(PaymentProcessPage, "+JhyKI/TCt/o3i650dm/GAytAZk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = PaymentProcessPage;
var _c;
__turbopack_refresh__.register(_c, "PaymentProcessPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/payments/process/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
}]);

//# sourceMappingURL=src_9447d0._.js.map