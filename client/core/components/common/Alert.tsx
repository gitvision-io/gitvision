import { Variant } from "./Variant";

const variantColor = {
  info: "blue",
  danger: "red",
  success: "teal",
  warning: "yellow",
  default: "gray",
};

interface AlertProps {
  children: React.ReactNode;
  variant?: Variant;
}

const Alert = ({ children, variant }: AlertProps) => {
  return (
    <div
      className={`p-4 mb-4 text-sm text-${variantColor[variant!]}-700 bg-${
        variantColor[variant!]
      }-100 rounded-lg dark:bg-${variantColor[variant!]}-200 dark:text-${
        variantColor[variant!]
      }-800`}
      role="alert"
    >
      {children}
    </div>
  );
};

Alert.defaultProps = {
  variant: "default",
};

export default Alert;
