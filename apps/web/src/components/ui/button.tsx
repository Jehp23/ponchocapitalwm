import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4d3a] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#1f4d3a] px-4 py-2 text-[#f8f5ef] hover:bg-[#183c2e]",
        secondary: "border border-[#1f4d3a]/12 bg-[#1f4d3a]/6 px-4 py-2 text-[#1f4d3a] hover:bg-[#1f4d3a]/10",
        ghost: "px-3 py-2 text-[#355746] hover:bg-[#1f4d3a]/6"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant }), className)} ref={ref} {...props} />
));

Button.displayName = "Button";

export { Button, buttonVariants };
