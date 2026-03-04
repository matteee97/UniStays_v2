import LoadingIcon from "@/ui/components/common/shared/icons/loadingIcon";
export default function FormHeader({ loading }) {
  return (
    <>
      {loading && <LoadingIcon />}

      <h1 className="text-4xl lg:text-5xl gplus:text-6xl text-gray-700 font-bold pt-6 px-4 text-center mb-5">
        Pubblica annuncio
      </h1>
      <h3 className="text-gray-500 font-medium text-center">
        Pubblica un annuncio per affitti universitari in Italia, in modo facile
        e gratuito. Raggiungi migliaia di studenti!
      </h3>
    </>
  );
}
