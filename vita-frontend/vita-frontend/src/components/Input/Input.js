import "./Input.css";
import clsx from "clsx";

const Input = ({ text, placeholder, type, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{text}</label>
      <input
        type={type}
        className={clsx(
          "input-box rounded-md p-2 sm:p-3 w-60 sm:w-72 md:w-96 text-sm font-medium text-black",
          className
        )}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

export default Input;
