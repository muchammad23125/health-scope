
// @ts-ignore: Ignore CSS import declaration missing in TS config
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import "maplibre-gl/dist/maplibre-gl.css";
import Footer from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
