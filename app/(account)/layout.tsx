import { Navbar } from "@components";
import "@styles/globals.css";
import { Toaster } from "react-hot-toast";
export const metadata = {
  title: "Facebook",
  description: "Generated IN Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
