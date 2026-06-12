// @ts-ignore
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
// import "maplibre-gl/dist/maplibre-gl.css";  

import "maplibre-gl/dist/maplibre-gl.css";

import {
  UserRiskProvider,
} from "@/context/UserRiskContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>

        <UserRiskProvider>

          <Navbar />

          {children}

          <Footer />

        </UserRiskProvider>

      </body>
    </html>
  );
}