'use client';


const variantStyles = {
    primary: 'bg-main-600 text-main-100 enabled:hover:bg-[hsl(0_8%_35%)]',
    secondary: 'bg-main-500 text-main-100 enabled:hover:bg-[hsl(0_10%_61%)]',
    accent: 'bg-main-300 text-main-100 enabled:hover:bg-[hsl(0_12%_79%)]',
    danger: 'bg-main-800 text-main-100 enabled:hover:bg-[hsl(0_10%_13%)]',
    order: 'bg-main-200 text-main-500 border border-main-300 rounded-sm py-xs enabled:hover:bg-main-300',
};

export default function Button({
    children,
    variant = 'primary',
    disabled = false,
    isLoading = false,
    className = '',
    onClick,
    type = 'button',
    ...rest
}) {
    const baseStyles = `inline-flex items-center justify-center gap-xs ${variant === 'order' ? 'px-0' : 'px-md'} py-sm rounded-md font-sans text-base font-semibold transition-all duration-200 ease-in-out outline-none cursor-pointer`;
    const interactionStyles = "hover:-translate-y-[1px] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none";
    const loadingStyles = isLoading ? "cursor-wait opacity-70 pointer-events-none" : "";

    const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${interactionStyles} ${loadingStyles} ${className}`;

    return (
        <button
            type={type}
            className={combinedClasses}
            onClick={onClick}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
}