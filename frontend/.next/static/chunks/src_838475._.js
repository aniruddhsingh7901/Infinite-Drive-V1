(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_838475._.js", {

"[project]/src/components/Button.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>Button)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
'use client';
;
function Button({ children, className = '', onClick, type = 'button', ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: type,
        className: `bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ${className}`,
        onClick: onClick,
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/Button.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = Button;
var _c;
__turbopack_refresh__.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/admin/books/add/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Button from '@/components/Button';
// export default function AddBook() {
//   const router = useRouter();
//   const [bookData, setBookData] = useState({
//     title: '',
//     description: '',
//     price: '',
//     file: null as File | null
//   });
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     // This would upload the book file and create the book entry
//     console.log('Creating book:', bookData);
//     router.push('/admin/books');
//   };
//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
//       <h1 className="text-2xl font-bold mb-6">Add New Book</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block mb-1">Title</label>
//           <input
//             type="text"
//             value={bookData.title}
//             onChange={(e) => setBookData({...bookData, title: e.target.value})}
//             className="w-full p-2 border rounded"
//             required
//           />
//         </div>
//         <div>
//           <label className="block mb-1">Description</label>
//           <textarea
//             value={bookData.description}
//             onChange={(e) => setBookData({...bookData, description: e.target.value})}
//             className="w-full p-2 border rounded"
//             rows={4}
//             required
//           />
//         </div>
//         <div>
//           <label className="block mb-1">Price</label>
//           <input
//             type="number"
//             value={bookData.price}
//             onChange={(e) => setBookData({...bookData, price: e.target.value})}
//             className="w-full p-2 border rounded"
//             required
//           />
//         </div>
//         <div>
//           <label className="block mb-1">Book File</label>
//           <input
//             type="file"
//             onChange={(e) => setBookData({...bookData, file: e.target.files?.[0] || null})}
//             className="w-full p-2 border rounded"
//             accept=".pdf,.epub"
//             required
//           />
//         </div>
//         <div className="flex justify-end space-x-4">
//           <Button onClick={() => router.back()} className="bg-gray-500">
//             Cancel
//           </Button>
//           <Button type="submit">
//             Add Book
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }
// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';
// import Button from '@/components/Button';
// interface BookForm {
//   title: string;
//   description: string;
//   price: string;
//   formats: ('pdf' | 'epub')[];
//   coverImage: File | null;
//   bookFiles: {
//     pdf?: File;
//     epub?: File;
//   };
// }
// export default function AddBook() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState<BookForm>({
//     title: '',
//     description: '',
//     price: '',
//     formats: ['pdf'],
//     coverImage: null,
//     bookFiles: {}
//   });
// const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const data = new FormData();
//       // Basic info
//       data.append('title', formData.title);
//       data.append('description', formData.description);
//       data.append('price', formData.price);
//       data.append('formats', formData.formats.join(','));
//       // Cover image
//       if (formData.coverImage) {
//         data.append('coverImage', formData.coverImage);
//       }
//       // Book files with format-specific fields
//       if (formData.bookFiles.pdf) {
//         data.append('pdfFile', formData.bookFiles.pdf);
//       }
//       if (formData.bookFiles.epub) {
//         data.append('epubFile', formData.bookFiles.epub);
//       }
//       // Validate required files
//       const missingFiles = formData.formats.filter(format => !formData.bookFiles[format]);
//       if (missingFiles.length > 0) {
//         throw new Error(`Missing files for formats: ${missingFiles.join(', ')}`);
//       }
//       const response = await axios.post('http://localhost:5000/books/add', data, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
//           console.log('Upload Progress:', percentCompleted);
//         },
//       });
//       console.log('Book added successfully:', response.data);
//       router.push('/admin/books');
//     } catch (error) {
//       console.error('Error adding book:', error);
//       // Handle specific error cases
//       if (axios.isAxiosError(error)) {
//         if (error.response?.status === 413) {
//           alert('File size too large');
//         } else {
//           alert(error.response?.data?.message || 'Error uploading book');
//         }
//       }
//     } finally {
//       setLoading(false);
//     }
// };
//   return (
//     <div className="max-w-3xl mx-auto">
//       <div className="bg-white rounded-lg shadow p-6">
//         <h1 className="text-2xl font-bold mb-6">Add New Book</h1>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Info */}
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Title
//               </label>
//               <input
//                 type="text"
//                 required
//                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 value={formData.title}
//                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <textarea
//                 required
//                 rows={4}
//                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Price ($)
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 required
//                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 value={formData.price}
//                 onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//               />
//             </div>
//           </div>
//           {/* Format Selection */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Available Formats
//             </label>
//             <div className="flex gap-4">
//               {['pdf', 'epub'].map((format) => (
//                 <label key={format} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={formData.formats.includes(format as 'pdf' | 'epub')}
//                     onChange={(e) => {
//                       const newFormats = e.target.checked
//                         ? [...formData.formats, format as 'pdf' | 'epub']
//                         : formData.formats.filter(f => f !== format);
//                       setFormData({ ...formData, formats: newFormats });
//                     }}
//                     className="mr-2"
//                   />
//                   {format}
//                 </label>
//               ))}
//             </div>
//           </div>
//           {/* File Uploads */}
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Cover Image
//               </label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => setFormData({
//                   ...formData,
//                   coverImage: e.target.files?.[0] || null
//                 })}
//                 className="w-full"
//               />
//             </div>
//             {formData.formats.map((format) => (
//               <div key={format}>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   {format} File
//                 </label>
//                 <input
//                   type="file"
//                   accept={format === 'pdf' ? '.pdf' : '.epub'}
//                   onChange={(e) => setFormData({
//                     ...formData,
//                     bookFiles: {
//                       ...formData.bookFiles,
//                       [format]: e.target.files?.[0]
//                     }
//                   })}
//                   className="w-full"
//                 />
//               </div>
//             ))}
//           </div>
//           {/* Submit Buttons */}
//           <div className="flex justify-end space-x-4 pt-4">
//             <Button
//               type="button"
//               className="bg-gray-500 hover:bg-gray-600"
//               onClick={() => router.back()}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={loading}
//               className={loading ? 'opacity-50 cursor-not-allowed' : ''}
//             >
//               {loading ? 'Adding Book...' : 'Add Book'}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
__turbopack_esm__({
    "default": (()=>AddBook)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/components/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
'use client';
;
;
;
;
function AddBook() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [uploadProgress, setUploadProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        bookId: '',
        title: '',
        description: '',
        price: '',
        formats: [
            'pdf'
        ],
        coverImage: null,
        ebooks: {}
    });
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setLoading(true);
        setUploadProgress(0);
        try {
            // Form validation
            if (!formData.title || !formData.description || !formData.price) {
                throw new Error('Please fill in all required fields');
            }
            if (!formData.coverImage) {
                throw new Error('Cover image is required');
            }
            // Create FormData
            const data = new FormData();
            console.log("🚀 ~ handleSubmit ~ data:", data);
            // Add basic info
            const bookId = `${Date.now()}-${formData.formats[0]}`;
            data.append('id', bookId); // Add the ID to form data
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('formats', formData.formats.join(','));
            // Add cover image
            if (formData.coverImage) {
                data.append('coverImage', formData.coverImage);
            }
            // Add book files using correct field name
            formData.formats.forEach((format)=>{
                const file = formData.ebooks[format];
                if (file) {
                    // Use the exact field name expected by multer
                    data.append('ebooks', file);
                }
            });
            // Make API call to backend
            const token = localStorage.getItem('token');
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('http://localhost:5000/books/add', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                timeout: 120000,
                onUploadProgress: (progressEvent)=>{
                    const percentCompleted = progressEvent.total ? Math.round(progressEvent.loaded * 100 / progressEvent.total) : 0;
                    setUploadProgress(percentCompleted);
                }
            });
            console.log("🚀 ~ handleSubmit ~ response:", response);
            console.log('Book added successfully:', response.data);
            router.push('/admin/books');
        } catch (error) {
            console.error('Error adding book:', error);
            if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isAxiosError(error)) {
                const message = error.response?.data?.message || 'Error uploading book';
                if (error.response?.status === 413) {
                    alert('File size too large - Maximum size is 100MB');
                } else if (error.response?.status === 400) {
                    alert(message);
                } else {
                    alert('Server error - Please try again later');
                }
            } else if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('An unexpected error occurred');
            }
        } finally{
            setLoading(false);
            setUploadProgress(0);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-3xl mx-auto p-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-lg shadow p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold mb-6",
                    children: "Add New Book"
                }, void 0, false, {
                    fileName: "[project]/src/app/admin/books/add/page.tsx",
                    lineNumber: 426,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 mb-1",
                                            children: "Title *"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                                            lineNumber: 432,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            required: true,
                                            className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500",
                                            value: formData.title,
                                            onChange: (e)=>setFormData({
                                                    ...formData,
                                                    title: e.target.value
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                                            lineNumber: 435,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/books/add/page.tsx",
                                    lineNumber: 431,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 mb-1",
                                            children: "Description *"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                                            lineNumber: 445,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            required: true,
                                            rows: 4,
                                            className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500",
                                            value: formData.description,
                                            onChange: (e)=>setFormData({
                                                    ...formData,
                                                    description: e.target.value
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                                            lineNumber: 448,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/books/add/page.tsx",
                                    lineNumber: 444,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 mb-1",
                                            children: "Price ($) *"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                                            lineNumber: 458,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            step: "0.01",
                                            min: "0",
                                            required: true,
                                            className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500",
                                            value: formData.price,
                                            onChange: (e)=>setFormData({
                                                    ...formData,
                                                    price: e.target.value
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                                            lineNumber: 461,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/books/add/page.tsx",
                                    lineNumber: 457,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                            lineNumber: 430,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 mb-2",
                                    children: "Available Formats *"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/books/add/page.tsx",
                                    lineNumber: 475,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-4",
                                    children: [
                                        'pdf',
                                        'epub'
                                    ].map((format)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "flex items-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: formData.formats.includes(format),
                                                    onChange: (e)=>{
                                                        const newFormats = e.target.checked ? [
                                                            ...formData.formats,
                                                            format
                                                        ] : formData.formats.filter((f)=>f !== format);
                                                        setFormData({
                                                            ...formData,
                                                            formats: newFormats
                                                        });
                                                    },
                                                    className: "mr-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/admin/books/add/page.tsx",
                                                    lineNumber: 481,
                                                    columnNumber: 19
                                                }, this),
                                                format
                                            ]
                                        }, format, true, {
                                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                                            lineNumber: 480,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/books/add/page.tsx",
                                    lineNumber: 478,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                            lineNumber: 474,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-sm font-medium text-gray-700 mb-1",
                                            children: "Cover Image *"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                                            lineNumber: 501,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "file",
                                            accept: "image/*",
                                            required: true,
                                            onChange: (e)=>setFormData({
                                                    ...formData,
                                                    coverImage: e.target.files?.[0] || null
                                                }),
                                            className: "w-full"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                                            lineNumber: 504,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/admin/books/add/page.tsx",
                                    lineNumber: 500,
                                    columnNumber: 13
                                }, this),
                                formData.formats.map((format)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-sm font-medium text-gray-700 mb-1",
                                                children: [
                                                    format,
                                                    " File *"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/admin/books/add/page.tsx",
                                                lineNumber: 518,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "file",
                                                accept: format === 'pdf' ? '.pdf' : '.epub',
                                                required: true,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        ebooks: {
                                                            ...formData.ebooks,
                                                            [format]: e.target.files?.[0]
                                                        }
                                                    }),
                                                className: "w-full"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/admin/books/add/page.tsx",
                                                lineNumber: 521,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, format, true, {
                                        fileName: "[project]/src/app/admin/books/add/page.tsx",
                                        lineNumber: 517,
                                        columnNumber: 15
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                            lineNumber: 499,
                            columnNumber: 11
                        }, this),
                        uploadProgress > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-full bg-gray-200 rounded-full h-2.5",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-blue-600 h-2.5 rounded-full",
                                style: {
                                    width: `${uploadProgress}%`
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/admin/books/add/page.tsx",
                                lineNumber: 541,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                            lineNumber: 540,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end space-x-4 pt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    type: "button",
                                    className: "bg-gray-500 hover:bg-gray-600",
                                    onClick: ()=>router.back(),
                                    disabled: loading,
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/books/add/page.tsx",
                                    lineNumber: 550,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    type: "submit",
                                    disabled: loading,
                                    className: `bg-blue-600 hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`,
                                    children: loading ? `Uploading ${uploadProgress}%` : 'Add Book'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/admin/books/add/page.tsx",
                                    lineNumber: 558,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/admin/books/add/page.tsx",
                            lineNumber: 549,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/admin/books/add/page.tsx",
                    lineNumber: 428,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/admin/books/add/page.tsx",
            lineNumber: 425,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/admin/books/add/page.tsx",
        lineNumber: 424,
        columnNumber: 5
    }, this);
}
_s(AddBook, "iNJcocYuiz//yR8K6WeS97cJN1M=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AddBook;
var _c;
__turbopack_refresh__.register(_c, "AddBook");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/admin/books/add/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
}]);

//# sourceMappingURL=src_838475._.js.map