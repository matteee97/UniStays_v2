import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generatePdf = async (ref, appID) => {
    const canvas = await html2canvas(ref.current, {
        useCORS: true,
        backgroundColor: "#fff",
        scale: 7,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.9);

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [794, 1123], // formato A4 in px
    });

    pdf.addImage(imgData, "JPEG", 0, 0, 794, 1123);
    pdf.save(`annuncio-${appID}.pdf`);
};