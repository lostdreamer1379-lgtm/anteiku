import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const variants = {
  primary: "bg-forest text-ivory hover:bg-sage hover:text-bg-primary",
  secondary: "border border-border-subtle text-ivory hover:bg-bg-card",
  ghost: "text-muted hover:text-ivory",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        "rounded-anteiku px-5 py-2.5 text-sm font-medium tracking-wide transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage",
        variants[variant],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export default Button;
