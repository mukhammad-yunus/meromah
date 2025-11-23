import { useRef } from "react";

const AutoResizeTextarea = ({ value, onChange, ...props }) => {
  const ref = useRef(null);

  const handleInput = (e) => {
    const el = ref.current;
    if (!el) return;

    // Reset height so shrinking works too
    el.style.height = "auto";

    // Set height to the scroll height
    el.style.height = `${el.scrollHeight}px`;

    onChange(e);
  };

  return (
    <textarea
      {...props}
      ref={ref}
      value={value}
      onInput={handleInput}
      rows={1}
      style={{ overflow: "hidden", resize: "none" }}
    />
  );
};

export default AutoResizeTextarea;
