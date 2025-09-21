import Footer from "@/shared/components/footer/Footer";
import "../../globals.css";
import Header from "@/shared/components/header/Header";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="ru">
      <body style={{ cursor: "auto" }}>
        <Header />
        <div className="w-full min-h-[calc(100dvh_-_220px)]">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}