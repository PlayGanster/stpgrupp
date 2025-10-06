import Footer from "@/shared/components/footer/Footer";
import "../../globals.css";
import Header from "@/shared/components/header/Header";
import YandexMetrika from "@/shared/components/yandexMetrika/YandexMetrica";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="ru">
      <head>
        {/* Базовые favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        
        {/* Для Apple устройств */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Android Chrome */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Цвет темы для адресной строки */}
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body style={{ cursor: "auto" }}>
        <Header />
        <div className="w-full min-h-[calc(100dvh_-_220px)]">
          {children}
          <YandexMetrika />
        </div>
        <Footer />
      </body>
    </html>
  );
}