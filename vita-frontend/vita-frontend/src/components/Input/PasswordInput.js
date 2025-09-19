import { useState, useCallback, use } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./Input.css";
import clsx from "clsx";

const PasswordInput = ({ placeholder, text, type, className, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const handleKeyEvent = useCallback((e) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
  }, []);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{text}</label>
      <div className="relative">
        <input
          className={clsx(
            "input-box rounded-md p-2 sm:p-3 w-60 sm:w-72 md:w-96 text-sm font-medium text-black",
            className
          )}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          onKeyDown={handleKeyEvent}
          onKeyUp={handleKeyEvent}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-800 transition-colors duration-200"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        {capsLockOn && (
          <div className="absolute -bottom-6 left-0 text-xs text-red-500">
            CapsLock Açık
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordInput;
