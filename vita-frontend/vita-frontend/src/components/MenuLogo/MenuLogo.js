import "../Logo/Logo.css";
import clsx from "clsx";

const MenuLogo = ({ className }) => {
  return <div className={clsx("text-5xl logo", className)}>Vita</div>;
};

export default MenuLogo;
