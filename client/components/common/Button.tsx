import Link from "next/link";
import Loader from "./Loader";
import { Size, Variant } from "./Variant";

interface ButtonProps {
  children?: React.ReactNode;
  variant: Variant;
  size: Size;
  isLink: boolean;
  className?: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: "button" | "submit";
  isLoading?: boolean;
  loadingText?: string;
  isDisabled?: boolean;
}

const variantClasses: Record<Variant, string> = {
  default: "text-white bg-gray-600 hover:bg-gray-800",
  success:
    "text-white bg-deep-purple-accent-400 hover:bg-deep-purple-accent-700",
  info: "text-white bg-blue-600 hover:bg-blue-800",
  warning: "text-white bg-yellow-600 hover:bg-yellow-800",
  danger: "text-white bg-red-600 hover:bg-red-800",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 py-1",
  md: "h-12 px-6",
  lg: "",
  xl: "",
};

const Button = ({
  children,
  variant,
  isLink,
  href,
  className,
  onClick,
  isLoading,
  loadingText,
  isDisabled,
  size,
  type,
}: ButtonProps) => {
  const computedChildren = isLoading ? <Loader text={loadingText} /> : children;

  const computedClassName = `inline-flex items-center justify-center font-medium tracking-wide transition duration-200 rounded shadow-md focus:shadow-outline focus:outline-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  if (isLink) {
    return (
      <Link href={href!}>
        <a className={computedClassName} onClick={onClick}>
          {computedChildren}
        </a>
      </Link>
    );
  }

  return (
    <button
      className={computedClassName}
      onClick={onClick}
      disabled={isDisabled}
      type={type}
    >
      {computedChildren}
    </button>
  );
};

Button.defaultProps = {
  variant: "default",
  size: "md",
  isLink: false,
  type: "button",
  isLoading: false,
  loadingText: "Loading...",
  isDisabled: false,
};

export default Button;
