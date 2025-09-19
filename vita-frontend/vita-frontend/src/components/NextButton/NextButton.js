import clsx from "clsx";

const NextButton = ({ children, onClick, disabled, className, ...props }) => {
  return (
    <button
      className={clsx(
        "bg-[#f3f3f3] text-[#26282b] rounded-md py-2 px-8 mt-4 font-semibold text-md transition-colors",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#dfdcdc]",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default NextButton;
