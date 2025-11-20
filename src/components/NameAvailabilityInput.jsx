import React, { useState, useMemo, useEffect } from "react";
const MIN_LENGTH = 3;
const MAX_LENGTH = 20;

const NameAvailabilityInput = ({
  // Value and onChange
  value,
  onChange,

  // API hook for checking availability (RTK Query hook)
  useCheckAvailabilityQuery,

  // Configuration
  label = "Name",
  placeholder = "e.g., My-Name",
  urlPrefix = null, // "b/" | "d/" | "u/" - if null, no preview shown
  originalName = null, // Original name for edit mode (skips API check if unchanged)
  // Callbacks
  onValidationChange, // (isValid, errorMessage) => void
  onSpecialCharDetected, // (hasSpecialChar) => void - for parent to show toast
  inputRef, // Ref for parent form access
}) => {
  const [hasSpecialChar, setHasSpecialChar] = useState(false);

  // Determine when to skip API check
  const shouldSkipCheck = useMemo(() => {
    const trimmed = value.trim();
    const unchanged = originalName && trimmed === originalName;
    return (
      !trimmed ||
      unchanged ||
      trimmed.length < MIN_LENGTH ||
      trimmed.length > MAX_LENGTH
    );
  }, [value, originalName]);

  // Check name availability via API
  const { data: availabilityData, isFetching: isChecking } =
    useCheckAvailabilityQuery({ value }, { skip: shouldSkipCheck });

  // Compute availability status
  const isAvailable = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return true;
    if (originalName && trimmed === originalName) return true;
    return availabilityData?.isAvailable ?? false;
  }, [value, originalName, availabilityData]);

  // Generate error message
  const errorMessage = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (originalName && trimmed === originalName) return null;

    if (trimmed.length < MIN_LENGTH) {
      return `${label} must be at least ${MIN_LENGTH} characters long`;
    }
    if (trimmed.length > MAX_LENGTH) {
      return `${label} must be ${MAX_LENGTH} characters or less`;
    }
    if (!isAvailable && !isChecking) {
      return "This name is already taken, please choose another";
    }
    return null;
  }, [
    value,
    originalName,
    isAvailable,
    isChecking,
    label,
  ]);



  // Handle input change with special character validation
  const handleChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue.length === 0) {
      setHasSpecialChar(false);
      onChange(inputValue);
      return;
    }

    const validationRegex = /^[a-zA-Z0-9 _]+$/;
    const isValid = validationRegex.test(inputValue);
    setHasSpecialChar(!isValid);

    if (isValid) {
      onChange(inputValue.replace(/\s+/g, "_"));
    }
  };

  // Notify parent of validation changes
  useEffect(() => {
    const isValid = !errorMessage && !isChecking && value.trim().length > 0;
    if (onValidationChange) {
      onValidationChange(isValid, errorMessage);
    }
  }, [errorMessage, isChecking, value, onValidationChange]);

  // Notify parent of special char detection
  useEffect(() => {
    if (onSpecialCharDetected) {
      onSpecialCharDetected(hasSpecialChar);
    }
  }, [hasSpecialChar, onSpecialCharDetected]);

  // Show preview URL only when valid and there's a urlPrefix
  const showPreview =
    urlPrefix && value && !errorMessage && value !== originalName;

  return (
    <div className="flex flex-col">
      <label className="font-medium text-neutral-800">{`${label} *`}</label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required
        className={`w-full px-3 py-2 mt-2 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ${
          errorMessage
            ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
            : "border-slate-200 focus:ring-blue-500/30 focus:border-blue-500"
        } placeholder-slate-400`}
      />
      {/* Preview URL (animated) - only if urlPrefix provided */}
      {urlPrefix && (
        <div
          className={`text-xs text-slate-500 transition-all duration-300 ease-in-out ${
            showPreview
              ? "mt-1.5 max-h-10 opacity-100 translate-y-0"
              : "mt-0 max-h-0 opacity-0 -translate-y-1 overflow-hidden"
          }`}
        >
          {urlPrefix}
          {value}
        </div>
      )}

      {/* Error message (animated) */}
      <div
        className={`text-xs text-red-500 font-medium transition-all duration-300 ease-in-out ${
          errorMessage
            ? "mt-1.5 max-h-10 opacity-100 translate-y-0"
            : "mt-0 max-h-0 opacity-0 -translate-y-1 overflow-hidden"
        }`}
      >
        {errorMessage}
      </div>
    </div>
  );
};

export default NameAvailabilityInput;
