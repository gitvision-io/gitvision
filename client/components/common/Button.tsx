import Link from "next/link";
import { Variant } from "./Variant";

interface ButtonProps {
  children?: React.ReactNode;
  variant: Variant;
  isLink: boolean;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const variantClasses: Record<Variant, string> = {
  [Variant.Default]: "text-white bg-gray-600 hover:bg-gray-800",
  [Variant.Success]:
    "text-white bg-deep-purple-accent-400 hover:bg-deep-purple-accent-700",
};

const Button = ({ children, variant, isLink, href, onClick }: ButtonProps) => {
  const className = `inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide transition duration-200 rounded shadow-md focus:shadow-outline focus:outline-none ${variantClasses[variant]}`;
  if (isLink) {
    return (
      <Link href={href!}>
        <a className={className} onClick={onClick}>
          {children}
        </a>
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
};

Button.defaultProps = {
  variant: Variant.Default,
  isLink: false,
};

export default Button;
