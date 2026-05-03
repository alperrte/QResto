import "./globals.css";

export const metadata = {
  title: "QResto",
  description: "QResto frontend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}