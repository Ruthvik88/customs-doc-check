"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

import { ShieldCheck, HardDrive, Database, Verified, Settings } from "lucide-react";

export default function ExportEmptyPage() {
  return (
    <div className="bg-customs-surface font-body text-body-md text-customs-on-surface min-h-screen flex flex-col">

      <main className="w-full pt-16 flex-1 bg-customs-surface">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-[1536px] mx-auto px-4 lg:px-8 py-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-customs-surface-raised p-6 rounded-lg shadow-sm">
              <div className="space-y-1">
                <h1 className="font-headline text-headline-lg text-customs-ink-primary tracking-tight">
                  Export Shipments
                </h1>
                <p className="font-body text-body-md text-customs-ink-secondary">
                  Manager Only • Direct Customs ERP &amp; Filing Interface
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-1 rounded-lg text-customs-ink-secondary max-w-xl">
                <Icon as={HardDrive} size={16} className="text-customs-primary shrink-0" aria-hidden="true" />
                <p className="font-caption text-caption text-customs-ink-secondary leading-snug">
                  One row per line item, in the filing software&apos;s import layout
                </p>
              </div>
            </div>

            {/* Empty State Main Stage */}
            <div className="w-full bg-customs-surface-raised rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="relative py-20 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="relative mb-p-6">
                  <div className="relative w-20 h-20 rounded-2xl bg-customs-surface-container flex items-center justify-center text-customs-primary shadow-sm">
                    <Icon as={Database} size={20} aria-hidden="true" />
                  </div>
                </div>
                <h2 className="font-headline text-headline-lg text-customs-ink-primary tracking-tight max-w-md mb-2">
                  No approved shipments yet
                </h2>
                <p className="font-body text-body-md text-customs-ink-secondary max-w-xl mx-auto leading-relaxed mb-p-8">
                  Shipments must complete document verification and receive manager approval before export CSVs can
                  be generated. Once a shipment is approved, it will automatically appear here ready for filing.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2 z-10">
                  <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-customs-primary text-customs-on-primary font-headline text-headline-sm rounded-lg hover:bg-customs-primary-container transition-colors shadow-sm">
                    <Icon as={Verified} size={16} aria-hidden="true" />
                    <span>View Pending Approvals</span>
                  </Link>
                  <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-customs-surface-base text-customs-ink-primary font-headline text-headline-sm rounded-lg hover:bg-customs-surface-container transition-colors">
                    <Icon as={Settings} size={16} className="text-customs-ink-secondary" aria-hidden="true" />
                    <span>Go to Shipments Dashboard</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

