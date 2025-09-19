import clsx from "clsx";

const SignInUpButton = ({ className, children, onClick, ...props }) => {
  return (
    <button
      className={clsx(
        "rounded-md border-none p-3 mt-3 bg-[#26282b] text-white",
        className
      )}
      type="submit"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default SignInUpButton;
