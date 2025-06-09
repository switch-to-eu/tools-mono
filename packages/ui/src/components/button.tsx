import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "gradient-purple-blue text-white shadow-xs  hover:shadow-lg transition-all",
        // Solid color variants
        primary:
          "bg-primary text-white shadow-xs hover:opacity-90 focus-visible:ring-primary/20",
        secondary:
          "bg-secondary text-white shadow-xs hover:opacity-90 focus-visible:ring-secondary/20",
        tertiary:
          "bg-tertiary text-white shadow-xs hover:opacity-90 focus-visible:ring-tertiary/20",
        quaternary:
          "bg-quaternary text-white shadow-xs hover:opacity-90 focus-visible:ring-quaternary/20",
        // Gradient variants
        "gradient-primary":
          "gradient-primary text-white shadow-xs hover:opacity-90 hover:shadow-lg transition-all",
        "gradient-secondary":
          "gradient-secondary text-white shadow-xs hover:opacity-90  hover:shadow-lg transition-all",
        "gradient-tertiary":
          "gradient-tertiary text-white shadow-xs hover:opacity-90 hover:shadow-lg transition-all",
        "gradient-quaternary":
          "gradient-quaternary text-white shadow-xs hover:opacity-90 hover:shadow-lg transition-all",
        // Status variants - solid
        success:
          "bg-success text-white shadow-xs hover:opacity-90 focus-visible:ring-success/20",
        warning:
          "bg-warning text-white shadow-xs hover:opacity-90 focus-visible:ring-warning/20",
        destructive:
          "bg-destructive text-white shadow-xs hover:opacity-90 focus-visible:ring-destructive/20",
        // Utility variants
        neutral:
          "border border-primary bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        ghost:
          "shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        link:
          "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "gradient-primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };