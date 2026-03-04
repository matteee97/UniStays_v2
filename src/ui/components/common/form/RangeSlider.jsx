import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useTheme } from "@/ui/hooks";

const THUMB_WIDTH = 16;
/**
 * A component that renders a range slider with a label and a value.
 *
 * @param {string} label - The label of the range slider.
 * @param {string} text - The text of the range slider.
 * @param {string} simbol - The symbol of the range slider.
 * @param {number} minValue - The minimum value of the range slider.
 * @param {number} maxValue - The maximum value of the range slider.
 * @param {number} step - The step value of the range slider.
 * @param {number|array} value - The value of the range slider.
 * @param {function} onChange - The callback function to be called when the value of the range slider changes.
 * @param {string} className - The class name of the root element of the component.
 * @param {boolean} disabled - Whether the range slider is disabled.
 * @param {boolean} showValue - Whether to show the value of the range slider.
 */
const RangeSlider = ({
  label,
  text,
  simbol,
  minValue = 0,
  maxValue = 100,
  step = 1,
  value,
  onChange,
  className = "",
  disabled = false,
  showValue = false,
}) => {
  const inputRef = useRef(null);
  const isRange = Array.isArray(value);
  const clamp = (v) => Math.min(Math.max(v, minValue), maxValue);
  const isDark = useTheme().theme == "dark";

  const normalizeRange = (range) => {
    const raw = Array.isArray(range) ? range : [minValue, maxValue];
    const a = clamp(Number(raw[0] ?? minValue));
    const b = clamp(Number(raw[1] ?? maxValue));
    return a <= b ? [a, b] : [b, a];
  };

  const [start, end] = isRange
    ? normalizeRange(value)
    : [clamp(Number(value ?? minValue)), null];
  const [activeThumb, setActiveThumb] = useState(0); // 0=min, 1=max
  const [visibleValueLabel, setVisibleValueLabel] = useState(false);
  const [inputWidth, setInputWidth] = useState(0);

  const percent = useMemo(() => {
    if (isRange) return 0;
    const total = maxValue - minValue || 1;
    return ((start - minValue) / total) * 100;
  }, [start, minValue, maxValue, isRange]);

  const leftPx = useMemo(() => {
    if (!inputWidth) return 0;

    const usableWidth = inputWidth - THUMB_WIDTH;

    return (percent / 100) * usableWidth + THUMB_WIDTH / 2;
  }, [percent, inputWidth]);

  const gradientStyle = useMemo(() => {
    const total = maxValue - minValue || 1;
    const a = isRange ? ((start - minValue) / total) * 100 : 0;
    const b = isRange ? ((end - minValue) / total) * 100 : percent;

    return {
      background: `linear-gradient(90deg,
        ${isDark ? "#132337" : "#d4f1ee"} 0%,
        ${isDark ? "#132337" : "#d4f1ee"} ${a}%,
        ${isDark ? "#228E8D" : "#228E8D"} ${a}%,
        ${isDark ? "#228E8D" : "#228E8D"} ${b}%,
        ${isDark ? "#132337" : "#d4f1ee"} ${b}%,
        ${isDark ? "#132337" : "#d4f1ee"} 100%
      )`,
    };
  }, [end, isRange, maxValue, minValue, start]);

  useEffect(() => {
    if (!inputRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setInputWidth(rect.width);
    });

    observer.observe(inputRef.current);

    return () => observer.disconnect();
  }, []);

  const emitRange = (next0, next1) => {
    const a = clamp(next0);
    const b = clamp(next1);
    onChange && onChange([a, b]);
  };

  const emitSingle = (nextVal) => {
    const numeric = clamp(nextVal);
    onChange && onChange({ target: { value: numeric } }, numeric);
  };

  const updateRangeValue = (nextVal, index) => {
    const n = Number(nextVal);
    if (Number.isNaN(n)) return;

    // Prevent thumb crossing: clamp the moving thumb against the other bound.
    if (index === 0) {
      const next = end == null ? n : Math.min(n, end);
      emitRange(next, end);
      return;
    }

    const next = start == null ? n : Math.max(n, start);
    emitRange(start, next);
  };

  const updateSingleValue = (nextVal) => {
    const n = Number(nextVal);
    if (Number.isNaN(n)) return;
    emitSingle(n);
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      {(label || text || showValue) && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-700">{label ?? text}</p>

          {showValue && (
            <div className="flex items-center gap-2">
              {isRange ? (
                <>
                  <input
                    type="number"
                    className="w-20 px-2 py-1 text-sm font-medium text-[#228E8D] bg-transparent border border-[#D4F1EF] rounded focus:outline-none focus:ring-1 focus:ring-[#228E8D]"
                    value={start}
                    disabled={disabled}
                    onChange={(e) => updateRangeValue(e.target.value, 0)}
                  />
                  <span className="text-xs text-gray-400">-</span>
                  <input
                    type="number"
                    className="w-20 px-2 py-1 text-sm font-medium text-[#228E8D] bg-transparent border border-[#D4F1EF] rounded focus:outline-none focus:ring-1 focus:ring-[#228E8D]"
                    value={end}
                    disabled={disabled}
                    onChange={(e) => updateRangeValue(e.target.value, 1)}
                  />
                </>
              ) : (
                <input
                  type="number"
                  className="w-20 px-2 py-1 text-sm font-medium text-[#228E8D] bg-transparent border border-[#D4F1EF] rounded focus:outline-none focus:ring-1 focus:ring-[#228E8D]"
                  value={start}
                  disabled={disabled}
                  onChange={(e) => updateSingleValue(e.target.value)}
                />
              )}
              {simbol && (
                <span className="text-sm font-medium text-[#228E8D]">
                  {simbol}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div
        className={clsx("relative h-10 select-none", disabled && "opacity-60")}
      >
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded-full"
          style={gradientStyle}
          aria-hidden
        />

        {!isRange && visibleValueLabel && (
          <>
            <div
              className={
                "bg-[#228E8D] h-fit w-12 text-center px-2 py-[1px] text-white text-xs font-semibold rounded-md -translate-x-1/2 absolute -top-[42%] border border-[#d4f1ee] dark:border-[#0E1729]"
              }
              style={{
                left: `${Math.min(Math.max(48 / 2, leftPx), inputWidth - 48 / 2)}px`,
              }}
            >
              {start}
            </div>
            <span
              className="absolute -translate-x-[50%] top-0 h-[6px] w-[6px] bg-[#228E8D] rotate-45 border-b border-r border-[#d4f1ee] dark:border-[#0E1729]"
              style={{
                left: `${Math.min(Math.max(2, leftPx))}px`,
              }}
            />
          </>
        )}

        {isRange ? (
          <>
            <input
              type="range"
              min={minValue}
              max={maxValue}
              step={step}
              value={start}
              disabled={disabled}
              onPointerDown={(e) => {
                stop(e);
                setActiveThumb(0);
              }}
              onMouseDown={(e) => {
                stop(e);
                setActiveThumb(0);
              }}
              onTouchStart={(e) => {
                stop(e);
                setActiveThumb(0);
              }}
              onChange={(e) => {
                setActiveThumb(0);
                updateRangeValue(e.target.value, 0);
              }}
              className={clsx(
                "absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 w-full appearance-none bg-transparent pointer-events-none",
                "[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent",
                "[&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto no-dark",
              )}
              style={{ zIndex: activeThumb === 0 ? 60 : 40 }}
            />

            <input
              type="range"
              min={minValue}
              max={maxValue}
              step={step}
              value={end}
              disabled={disabled}
              onPointerDown={(e) => {
                stop(e);
                setActiveThumb(1);
              }}
              onMouseDown={(e) => {
                stop(e);
                setActiveThumb(1);
              }}
              onTouchStart={(e) => {
                stop(e);
                setActiveThumb(1);
              }}
              onChange={(e) => {
                setActiveThumb(1);
                updateRangeValue(e.target.value, 1);
              }}
              className={clsx(
                "absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 w-full appearance-none bg-transparent pointer-events-none",
                "[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent",
                "[&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto no-dark",
              )}
              style={{ zIndex: activeThumb === 1 ? 60 : 50 }}
            />
          </>
        ) : (
          <input
            ref={inputRef}
            type="range"
            min={minValue}
            max={maxValue}
            step={step}
            value={start}
            disabled={disabled}
            onChange={(e) => updateSingleValue(e.target.value)}
            onTouchStart={() => setVisibleValueLabel(true)}
            onTouchEnd={() => setVisibleValueLabel(false)}
            onMouseDown={() => setVisibleValueLabel(true)}
            onMouseUp={() => setVisibleValueLabel(false)}
            className={clsx(
              "absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 w-full appearance-none bg-transparent pointer-events-none",
              "[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent",
              "[&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto no-dark",
            )}
          />
        )}
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {showValue ? minValue : isRange ? start : minValue}
          {simbol}
        </span>
        <span>
          {showValue ? maxValue : isRange ? end : maxValue}
          {simbol}
        </span>
      </div>
    </div>
  );
};

export default RangeSlider;
