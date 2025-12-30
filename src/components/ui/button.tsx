import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:scale-105 hover:shadow-glow active:scale-100",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105",
        outline:
          "border-2 border-border bg-transparent text-foreground hover:bg-card hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-border hover:bg-card hover:shadow-md",
        ghost: 
          "text-foreground hover:bg-card",
        link: 
          "text-primary underline-offset-4 hover:underline",
        // FoodieHub custom variants
        hero:
          "bg-primary text-primary-foreground px-8 py-4 text-base hover:scale-105 hover:shadow-glow active:scale-100",
        cart:
          "bg-primary text-primary-foreground rounded-full hover:scale-110 hover:shadow-glow active:scale-95",
        icon:
          "bg-card text-foreground rounded-full hover:bg-primary hover:text-primary-foreground hover:scale-110",
        pill:
          "bg-card text-foreground border border-border rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
