import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen flex-col">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[var(--background)] p-4 lg:p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
