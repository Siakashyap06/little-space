import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, haptic } from "@/lib/utils";

/** Pill buttons from the Figma "Primary button" component (54px, Inter Semi Bold 16). */
const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-[9px] whitespace-nowrap rounded-full font-semibold leading-[1.4] transition-[transform,background-color,opacity] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border border-brand bg-brand text-white active:bg-brand-deep",
        tonal: "bg-brand-soft text-brand active:bg-[#dbe4d7]",
        muted: "bg-brand-soft text-subtle",
        ghost: "text-brand active:opacity-60",
      },
      size: {
        lg: "h-[54px] w-full px-6 text-[16px] [&_svg]:size-[19px]",
        md: "h-10 px-[14px] text-[13px]",
        redeem: "h-10 w-[108px] text-[16px]",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          haptic();
          onClick?.(e);
        }}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

/** 44×44 circular navigation control (chevron-left / x). */
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }
>(({ className, label, children, ...props }, ref) => (
  <button
    ref={ref}
    aria-label={label}
    className={cn(
      "flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-transform active:scale-95 [&_svg]:size-5",
      className,
    )}
    {...props}
  >
    {children}
  </button>
));
IconButton.displayName = "IconButton";
