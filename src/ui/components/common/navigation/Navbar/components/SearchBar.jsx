import SearchTray from "../../../search/SearchTray";

export default function SearchBar() {
  return (
    <div className="lg:block hidden absolute left-0 w-full h-full">
      <div className="mx-auto w-full h-full max-w-[800px] flex items-center px-20">
        <SearchTray />
      </div>
    </div>
  );
}
