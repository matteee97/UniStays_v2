export default function FormFieldset({ disabled, children }) {
  return (
    <fieldset
      disabled={disabled}
      className="max-w-[700px] xl:max-w-[900px] 2xl:max-w-[1200px] mx-auto p-4 sm:p-12 bg-[#87D2CE] dark:bg-[#0F172A] text-gray-600 font-medium sm:border-[3px] border-[#228e8c77] dark:border-[#1F2937] sm:rounded-xl shadow-[0_0_15px_1px_#87d2ceb2] dark:shadow-[0_12px_22px_5px_#00000050]"
    >
      {children}
    </fieldset>
  );
}
