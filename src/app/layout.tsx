import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { getDeviceType } from "@/lib/device";
import { DeviceProvider } from "@/components/system/DeviceProvider";

export const metadata: Metadata = {
  title: "Pick&Go — 오늘은 여행지를 뽑아보세요",
  description:
    "현재 위치, 여유 시간, 취향만 고르면 지금 떠날 수 있는 여행지 5곳을 랜덤 카드로 추천해드려요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2f73f6",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const device = await getDeviceType();

  return (
    <html lang="ko" data-device={device}>
      <body className="min-h-screen overflow-x-hidden">
        <DeviceProvider initial={device}>
          <Header />
          {children}
        </DeviceProvider>
      </body>
    </html>
  );
}
