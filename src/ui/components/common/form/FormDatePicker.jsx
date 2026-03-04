import { DATE_FORMATS } from "@/shared/types";
import React, { useEffect, useRef, useState } from "react";
import CustomDateInput from "./CustomDateInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";

const MONTHS_BY_NUMBER = {
  0: "Gennaio",
  1: "Febbraio",
  2: "Marzo",
  3: "Aprile",
  4: "Maggio",
  5: "Giugno",
  6: "Luglio",
  7: "Agosto",
  8: "Settembre",
  9: "Ottobre",
  10: "Novembre",
  11: "Dicembre",
};

const BASE_CLASSNAME = "!shadow-none !w-full !flex items-center justify-center";

const DISPAY_CLASSNAME = {
  vertical: "flex flex-col gap-2",
  horizontal: "flex gap-2 w-full",
};
const FormDatePicker = ({
  selected,
  handleDateChange,
  dateFormat,
  placeHolder,
  popperPlacement,
  calendarClassName,
  inline,
  dateSelectHelp,
  disabled,
  dispaly = "vertical",
  ...props
}) => {
  const monthIndex = new Date().getMonth();
  const pickerRef = useRef(null);
  const [pickerHeight, setPickerHeight] = useState(null);

  useEffect(() => {
    if (!pickerRef.current) return;

    const calendar = pickerRef.current.querySelector(".react-datepicker");
    if (!calendar) return;

    const height = calendar.getBoundingClientRect().height;
    setPickerHeight(height);
  }, [selected]);

  return (
    <div className={`${DISPAY_CLASSNAME[dispaly]}`} {...props}>
      <div ref={pickerRef}>
        <DatePicker
          selected={selected}
          onChange={handleDateChange}
          dateFormat={dateFormat ?? DATE_FORMATS.DISPLAY}
          placeholderText={placeHolder ?? "Seleziona una data"}
          popperPlacement={popperPlacement ?? "bottom-center"}
          customInput={<CustomDateInput />}
          minDate={new Date()}
          calendarClassName={calendarClassName ?? BASE_CLASSNAME}
          inline={inline}
          disabled={disabled}
        />
      </div>
      {dateSelectHelp && (
        <div className="relative flex flex-col">
          <span
            className={`absolute ${dispaly === "horizontal" ? "bottom-0 left-0 w-full h-2 bg-gradient-to-t" : "top-0 right-0 w-2 h-full bg-gradient-to-l"} from-white dark:from-[#0F1829] to-transparent z-50`}
          />
          <div
            className={`relative flex ${
              dispaly === "horizontal"
                ? "rounded-xl pb-1 px-2 flex-col min-h-0 h-0 flex-grow overflow-auto"
                : "pr-1 pb-2.5 overflow-x-auto"
            } items-center gap-2 w-full snap-mandatory`}
            style={
              dispaly === "horizontal" && pickerHeight
                ? { height: pickerHeight }
                : undefined
            }
          >
            {Array.of(...Array(12)).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const newDate = new Date();
                  if (newDate.getMonth() + index !== monthIndex)
                    newDate.setDate(1);
                  newDate.setMonth(newDate.getMonth() + index);
                  handleDateChange(newDate);
                }}
                disabled={disabled}
                className={` text-sm p-3 bg-[#f0fafb] dark:bg-[#0B1220] border-2 border-[#d4f1ef] rounded-2xl snap-start font-semibold text-slate-600 flex flex-col min-w-32 items-center gap-2 dark:shadow-md ${disabled && "opacity-70 cursor-not-allowed"}`}
              >
                <span className="px-2.5 py-1.5 bg-gradient-to-br from-[#228E8D] to-[#33aeac] rounded-full">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="text-white"
                  />
                </span>
                {MONTHS_BY_NUMBER[(monthIndex + index) % 12]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormDatePicker;
