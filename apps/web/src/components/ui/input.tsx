import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-13 w-full rounded-[18px] border border-[#1f4d3a]/10 bg-white px-4 text-[15px] text-[#183328] shadow-[0_1px_2px_rgba(23,49,38,0.04)] outline-none transition duration-200 placeholder:text-[#93a197] focus:border-[#1f4d3a]/28 focus:bg-[#fffdf8] focus:shadow-[0_0_0_4px_rgba(31,77,58,0.06)]",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
