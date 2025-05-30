import { Rubik } from "next/font/google";
import "./globals.css";

const fontRubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata = {
  title: "taleQ",
  description: "Talent Acquisition and Job Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${fontRubik.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
