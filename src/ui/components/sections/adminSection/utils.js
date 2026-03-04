import { APP_NAME } from "@/shared/constants";

/**
 * Builds a human-readable message for a platform notification based on the given header and body.
 * Optional parameters include:
 * - `signature`: boolean, whether to include a signature at the end of the message (default: true)
 * - `greeting`: boolean, whether to include a greeting at the beginning of the message (default: true)
 * @param {string} header - The header of the message
 * @param {string} body - The body of the message
 * @param {boolean} [signature=true] - Whether to include a signature at the end of the message
 * @param {boolean} [greeting=true] - Whether to include a greeting at the beginning of the message
 * @returns {string} - The final message
 */
export const buildPlatformMessage = (header, body, signature = true, greeting = true) => {
    const greetingText = greeting ? "Salve, \n\n" : "";
    const safeHeader = header ? header.trim().endsWith(".") ? header : `${header}.` : null;
    const safeBody = body ? body.trim().endsWith(".") ? body : `${body}.` : null;
    const mainText = header ? `${safeHeader}\n\n${safeBody}` : safeBody;
    const signatureText = signature
        ? `\n\nCordiali saluti,\nIl team di ${APP_NAME}.`
        : "";
    return greetingText + mainText + signatureText;
}
/**
 * Builds a human-readable header for a report based on the target type and id.
 * If isTargetHeader is true, the header will be written in a way that is suitable
 * for being displayed as a target header (e.g. "Segnalazione riguardante il tuo annuncio: <apartmentId>")
 * If isTargetHeader is false, the header will be written in a way that is suitable
 * for being displayed as a report header (e.g. "Segnalazione annuncio <apartmentId>")
 * @param {Object} report - The report object
 * @param {boolean} isTargetHeader - Whether the header should be written for a target header
 * @returns {String|null} - The built header string, or null if the report is invalid
 */

export const buildReportHeader = (report, isTargetHeader = false) => {
    if(!report) return null;

    const target  = report?.target || null;
    const type = target?.type || null;

    if(!type || !target) return null;
    
    switch(type) {
        case "apartment": {
            const { apartmentId } = target;
            if(!apartmentId) return null;
            return isTargetHeader 
                ? `Segnalazione riguardante il tuo annuncio: ${apartmentId}`
                : `Segnalazione annuncio ${apartmentId}`;
        }
        case "review": {
            const { reviewId } = target;
            if(!reviewId) return null;
            return isTargetHeader 
                ? `Segnalazione riguardante la tua recensione: ${reviewId}`
                : `Segnalazione recensione ${reviewId}`;
        }
        case "message": {
            const { conversationId, messageId } = target;
            if(!conversationId || !messageId) return null;
            return isTargetHeader 
                ? `Segnalazione riguardante il tuo messaggio ${messageId} nella conversazione ${conversationId}`
                : `Segnalazione messaggio ${messageId}`;
        }
        case "user": {
            const { userId } = target;
            if(!userId) return null;
            return isTargetHeader
                ? `Segnalazione riguardante il tuo account`
                : `Segnalazione utente ${userId}`;
        }
        default:
            return null;
    }
}