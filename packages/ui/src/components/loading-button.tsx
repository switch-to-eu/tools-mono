import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@workspace/ui/components/button";

interface LoadingButtonProps extends
    React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
    loading?: boolean;
    loadingText?: string;
    asChild?: boolean;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({ loading = false, loadingText, children, disabled, ...props }, ref) => {
        return (
            <Button
                variant="default"
                ref={ref}
                disabled={disabled ?? loading}
                {...props}
            >
                {loading ? (
                    <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {loadingText ?? "Loading..."}
                    </>
                ) : (
                    children
                )}
            </Button>
        );
    },
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton }; 