import Footer from "./Footer";
import NewsLetter from "./NewsLetter";

/**
 * Renders the footer section of the page with a newsletter and a footer.
 *
 * @returns {JSX.Element} The JSX element for the footer section.
 */
export default function FooterSection() {
  return (
    <>
      {/*<NewsLetter
        imgUrl={"/img/sky.webp"}
        whatsNewText={"Contatta un nostro operatore"}
        title={"Iscriviti alla NewsLetter"}
        subTitle={
          "Rimani sempre aggiornato sugli ultimi alloggi disponibili nella tua università"
        }
      />*/}

      <Footer
        logo={"/img/ExtendedLogo.svg"}
        mail={"unistays@support.it"}
        number={"+39 331 993 2488"}
        social1={"Facebook"}
        social2={"instagram"}
        linkSocial1={"https://www.facebook.com/"}
        linkSocial2={"https://www.instagram.com/"}
        linkSocial3={"https://www.x.com/"}
      />
    </>
  );
}
