
import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ label, error, id, className, ...props }, ref) {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div>
        <label
          htmlFor={fieldId}
          className="mb-1.5 block text-sm text-ivory"
        >
          {label}
        </label>

        <input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={clsx(
            "w-full rounded-anteiku border bg-bg-card px-4 py-2.5 text-sm text-ivory placeholder:text-muted",
            "focus:border-sage focus:outline-none",
            error ? "border-red-500/70" : "border-border-subtle",
            className
          )}
          {...props}
        />

        {error && (
          <p
            id={`${fieldId}-error`}
            role="alert"
            className="mt-1 text-xs text-red-400"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
