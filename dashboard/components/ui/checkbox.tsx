"use client";

import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof RadixCheckbox.Root>) {
  return (
    <RadixCheckbox.Root
      className={cn(
        "w-4 h-4 shrink-0 rounded border border-base-500 bg-base-900 data-[state=checked]:bg-accent-500 data-[state=checked]:border-accent-500 flex items-center justify-center",
        className
      )}
      {...props}
    >
      <RadixCheckbox.Indicator>
        <Check size={12} className="text-white" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
