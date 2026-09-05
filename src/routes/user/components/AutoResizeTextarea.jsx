import { useRef, useLayoutEffect } from "react";

const AutoResizeTextarea = ({ value, onChange, style, ...props }) => {
  const ref = useRef(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    resize();
  }, [value]);

  const handleInput = (e) => {
    resize();
    onChange(e);
  };

  return (
    <textarea
      {...props}
      ref={ref}
      value={value}
      onInput={handleInput}
      rows={1}
      style={{
        overflow: "hidden",
        resize: "none",
        ...style,
      }}
    />
  );
};

export default AutoResizeTextarea;
