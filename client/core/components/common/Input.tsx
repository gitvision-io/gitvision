import { ChangeEventHandler } from "react";

interface InputProps {
  label: string;
  id?: string;
  type?: "text" | "email" | "password" | "number";
  name?: string;
  autoComplete?: string;
  readOnly?: boolean;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

const Input = ({
  label,
  id,
  type,
  name,
  autoComplete,
  readOnly,
  value,
  onChange,
}: InputProps) => {
  return (
    <>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={id}
        autoComplete={autoComplete}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        readOnly={readOnly}
        onChange={onChange}
        value={value}
      />
    </>
  );
};

Input.defaultProps = {
  type: "text",
  value: "",
};

export default Input;
