"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

export function DialogContent({
  className,
  children,
  title,
}: {
  className?: string;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
      <RadixDialog.Content
        className={cn(
          "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl bg-base-900 border border-base-600 shadow-2xl p-6",
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <RadixDialog.Title className="text-lg font-semibold text-gray-100">{title}</RadixDialog.Title>
          <RadixDialog.Close className="text-gray-400 hover:text-gray-200 rounded-md p-1 hover:bg-base-800">
            <X size={18} />
          </RadixDialog.Close>
        </div>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
