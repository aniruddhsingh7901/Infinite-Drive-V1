// 'use client';
// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { AuthProvider } from "@/lib/auth/AuthContext";
// import { CartProvider } from "@/lib/cart/CartContext";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Infinite Drive - Ebook Store",
//   description: "Premium ebooks with crypto payments",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         {/* Wrapping the application with AuthProvider and CartProvider for authentication and cart functionality */}
//         <AuthProvider>
//           <CartProvider>
//             {children}
//           </CartProvider>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

// 'use client';
// 'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/authContext";
import { CartProvider } from "@/lib/cart/CartContext";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Infinite Drive - Self-Development and Self-Discipline E-books",
  description: "Premium ebooks with crypto payments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}

            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}