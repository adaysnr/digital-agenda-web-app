import "./Logo.css";
import clsx from "clsx";

export default function Logo({ className }) {
  return <div className={clsx("text-6xl logo", className)}>Vita</div>;
}
