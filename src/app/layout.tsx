import type { Metadata } from "next";
import { Inter, Roboto_Slab } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "@/index.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter" });
const robotoSlab = Roboto_Slab({ subsets: ["latin"], weight: ["500"], variable: "--font-roboto-slab" });

export const metadata: Metadata = {
  title: "Toy Library",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoSlab.variable}`}>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
