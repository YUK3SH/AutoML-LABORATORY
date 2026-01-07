import React, { useState, useRef, useEffect } from "react";

function Dropdown({ label, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="group relative text-sm text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition">
        {label}
        <span
          className="
            absolute left-0 -bottom-1 w-0 h-[2px] bg-black 
            group-hover:w-full transition-all duration-300
          "
        ></span>
      </button>

      <div
        className={`
          absolute left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 shadow-lg z-50
          transition-all duration-200 origin-top
          ${open ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"}
        `}
        style={{ transformOrigin: "top" }}
      >
        <div className="py-2">{children}</div>
      </div>
    </div>
  );
}

export default Dropdown;
