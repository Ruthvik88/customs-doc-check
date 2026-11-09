import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Moon,
  Sun,
  ShieldCheck,
  User,
  LogOut,
} from "lucide-react";

export default function ReportsLoading() {
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  return (
    <div className="bg-customs-surface-base font-body text-body-md text-customs-on-surface min-h-screen flex flex-col justify-between">
      <header className="fixed top-0 left-0 right-0 z-50 bg-customs-surface-raised/90 backdrop-blur-md border-b border-customs-border-hairline shadow-[0_1px_3px_rgba(15,27,45,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-p-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-p-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-customs-primary flex items-center justify-center text-customs-on-primary shadow-sm">
                <ShieldCheck className="text-[20px]" aria-hidden="true" />
              </div>
              <span className="font-headline-sm text-headline-sm text-customs-on-surface tracking-tight whitespace-nowrap">
                Customs Doc Check
              </span>
            </div>
            <nav className="flex items-center gap-1">
              <Link href="/dashboard" className="px-4 py-2 text-customs-on-surface-variant hover:text-customs-on-surface hover:bg-customs-surface-container-high transition-all font-body text-body-sm">
                Shipments
              </Link>
              <Link href="/reports" aria-current="page" className="px-4 py-2 transition-all bg-customs-primary text-customs-on-primary-container rounded-lg font-medium shadow-sm">
                Accuracy Report
              </Link>
              <Link href="/export" className="px-4 py-2 text-customs-on-surface-variant hover:text-customs-on-surface hover:bg-customs-surface-container-high transition-all font-body text-body-sm">
                Export
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-customs-surface-container text-customs-secondary font-label-code-sm text-label-code-sm uppercase tracking-wider font-semibold border border-customs-border-hairline">
              DOCUMENTATION MANAGER
            </span>
            <span className="font-label-code-md text-label-code-md text-customs-ink-secondary hidden lg:inline-block">
              manager@demo.local
            </span>
            <div className="h-4 w-px bg-customs-border-hairline hidden lg:block"></div>
            <button aria-label="Toggle dark mode" className="w-8 h-8 rounded-lg flex items-center justify-center text-customs-on-surface-variant hover:bg-customs-surface-container-high hover:text-customs-on-surface transition-colors" type="button">
              {isDark ? (
                <Sun className="text-[20px]" aria-hidden="true" />
              ) : (
                <Moon className="text-[20px]" aria-hidden="true" />
              )}
            </button>
            <button aria-label="Sign out" className="w-8 h-8 rounded-lg flex items-center justify-center text-customs-on-surface-variant hover:bg-customs-surface-container-high hover:text-customs-on-surface transition-colors" type="button">
              <LogOut className="text-[20px]" aria-hidden="true" />
            </button>
            <div className="w-8 h-8 rounded-full bg-customs-primary flex items-center justify-center shadow-sm">
              <User className="text-customs-on-primary text-[18px]" aria-hidden="true" />
            </div>
          </div>
        </div>
      </header>
      <main className="w-full pt-16 bg-customs-surface-base flex-1">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-7xl mx-auto px-p-6 py-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Skeleton className="w-32 h-7" />
                <Skeleton className="w-20 h-5 rounded-full" />
              </div>
              <Skeleton className="w-80 max-w-full h-4 rounded" />
            </div>
            <div className="flex items-center gap-1 bg-customs-surface-container-high/60 p-1 rounded-lg w-fit">
              <div className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-customs-surface-raised shadow-sm">
                <Skeleton className="w-3.5 h-3.5 rounded-full" />
                <Skeleton className="w-16 h-3.5 rounded" />
              </div>
              <div className="flex items-center gap-1 px-4 py-1.5 rounded-lg">
                <Skeleton className="w-3.5 h-3.5 rounded-full" />
                <Skeleton className="w-20 h-3.5 rounded" />
              </div>
            </div>
            <div className="w-full bg-customs-surface-raised rounded-xl shadow-sm overflow-hidden">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[760px] w-full">
                  <div className="h-10 bg-customs-surface-base px-6 flex items-center">
                    <div className="w-5/12 flex items-center pr-p-4">
                      <Skeleton className="w-24 h-3 rounded" />
                    </div>
                    <div className="w-2/12 flex items-center justify-end px-4">
                      <Skeleton className="w-24 h-3 rounded" />
                    </div>
                    <div className="w-2/12 flex items-center justify-end px-4">
                      <Skeleton className="w-28 h-3 rounded" />
                    </div>
                    <div className="w-3/12 flex items-center justify-end pl-p-4">
                      <Skeleton className="w-32 h-3 rounded" />
                    </div>
                  </div>
                  <div className="w-full">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                      <div key={i} className="h-11 px-6 flex items-center">
                        <div className="w-5/12 flex items-center gap-2 pr-p-4">
                          <Skeleton className="w-4 h-4 rounded flex-shrink-0" />
                          <Skeleton className={`w-${i % 2 === 0 ? 48 : 56} h-3.5 rounded`} />
                        </div>
                        <div className="w-2/12 flex items-center justify-end px-4">
                          <Skeleton className={`w-${i % 2 === 0 ? 14 : 12} h-3.5 rounded`} />
                        </div>
                        <div className="w-2/12 flex items-center justify-end px-4">
                          <Skeleton className={`w-${i % 2 === 0 ? 10 : 12} h-3.5 rounded`} />
                        </div>
                        <div className="w-3/12 flex flex-col items-end gap-1 pl-p-4">
                          <Skeleton className="w-12 h-3 rounded" />
                          <Skeleton className="w-28 h-1 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-customs-surface-base px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-1 text-customs-ink-secondary font-caption text-caption">
                <div className="flex items-center gap-1">
                  <Skeleton className="w-36 h-3 rounded" />
                </div>
                <div className="font-label-code text-label-code-sm text-customs-ink-muted">
                  <Skeleton className="w-32 h-3 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full bg-customs-surface-raised border-t border-customs-border-hairline py-4">
        <div className="max-w-7xl mx-auto px-p-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-customs-ink-secondary">
          <div className="flex items-center gap-4 font-caption text-caption">
            <span>© 2025 Customs Doc Check. All rights reserved.</span>
            <span className="text-customs-border-hairline">•</span>
            <span>ISO 27001 &amp; WCO SAFE Framework Compliant</span>
            <span className="text-customs-border-hairline">•</span>
            <span className="inline-flex items-center gap-1 font-label-code text-label-code-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-customs-status-confirmed-text"></span>
              Audit Vault Active
            </span>
          </div>
          <div className="flex items-center gap-4 font-caption text-caption">
            <a className="hover:text-customs-on-surface transition-colors" href="#">
              Security Policy
            </a>
            <a className="hover:text-customs-on-surface transition-colors" href="#">
              API Clearance Docs
            </a>
            <a className="hover:text-customs-on-surface transition-colors" href="#">
              Data Retention SLA
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

