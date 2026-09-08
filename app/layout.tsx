import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "SaaSathon Starter", template: "%s · SaaSathon Starter" },
  description: "A small foundation for your next big idea.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:p-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
