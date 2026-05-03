import SearchTray from "../../../search/SearchTray";

export default function SearchBar({
  expanded = false,
  onExpandedChange,
  searchMode,
  outsideClickExceptSelector = null,
}) {
  return (
    <div
      className={`lg:block hidden ${
        expanded
          ? "absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 -translate-y-1/2"
          : "absolute left-0 top-0 h-full w-full"
      }`}
    >
      <div
        className={`mx-auto flex items-center h-full w-full transition-[max-width,padding] duration-300 ease-out ${
          expanded
            ? "max-w-[760px] items-center px-8"
            : "max-w-[800px] items-end px-20"
        }`}
      >
        <SearchTray
          onExpandedChange={onExpandedChange}
          searchMode={searchMode}
          outsideClickExceptSelector={outsideClickExceptSelector}
        />
      </div>
    </div>
  );
}
