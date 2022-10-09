import Link from "next/link";
import Loader from "./Loader";
import { Variant } from "./Variant";

interface ButtonProps {
  children?: React.ReactNode;
  variant: Variant;
  isLink: boolean;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: "button" | "submit";
  isLoading?: boolean;
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

const Button = ({
  children,
  variant,
  isLink,
  href,
  onClick,
  isLoading,
  isDisabled,
}: ButtonProps) => {
  const computedChildren = isLoading ? <Loader /> : children;

  const className = `inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide transition duration-200 rounded shadow-md focus:shadow-outline focus:outline-none ${variantClasses[variant]}`;
  if (isLink) {
    return (
      <Link href={href!}>
        <a className={className} onClick={onClick}>
          {computedChildren}
        </a>
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick} disabled={isDisabled}>
      {computedChildren}
    </button>
  );
};

Button.defaultProps = {
  variant: "default",
  isLink: false,
  type: "button",
  isLoading: false,
  isDisabled: false,
};

export default Button;
