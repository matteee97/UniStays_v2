const safeBtoa = (value) => {
  if (typeof btoa === "function") return btoa(value);
  return Buffer.from(value, "binary").toString("base64");
};

const safeAtob = (value) => {
  if (typeof atob === "function") return atob(value);
  return Buffer.from(value, "base64").toString("binary");
};

const encodeBase64 = (value) => {
  if (typeof TextEncoder !== "undefined") {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return safeBtoa(binary);
  }

  return safeBtoa(unescape(encodeURIComponent(value)));
};

const decodeBase64 = (value) => {
  const binary = safeAtob(value);

  if (typeof TextDecoder !== "undefined") {
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  return decodeURIComponent(escape(binary));
};

const toBase64Url = (value) =>
  value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromBase64Url = (value) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "===".slice((base64.length + 3) % 4);
  return base64 + padding;
};

export const normalizeChatPayload = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  const type = typeof payload.type === "string" ? payload.type : "text";
  if (typeof payload.content !== "string") return null;
  const meta =
    payload.meta && typeof payload.meta === "object" ? payload.meta : null;
  return { type, content: payload.content, meta };
};

export const encodeChatPayload = (payload) => {
  try {
    const normalized = normalizeChatPayload(payload);
    if (!normalized) return null;
    return toBase64Url(encodeBase64(JSON.stringify(normalized)));
  } catch (error) {
    return null;
  }
};

export const decodeChatPayload = (encoded) => {
  if (!encoded || typeof encoded !== "string") return null;
  try {
    const json = decodeBase64(fromBase64Url(encoded));
    return normalizeChatPayload(JSON.parse(json));
  } catch (error) {
    return null;
  }
};

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // forza 32bit
  }
  return Math.abs(hash).toString(36);
};


export const createBookingKey = ({
  userId,
  hostId,
  apartmentId,
  meta = {},
}) => {
  const parts = [
    userId,
    hostId,
    apartmentId,
    meta.date ?? "",
    meta.roomId ?? meta.roomsRequested ?? "",
  ];
  return `bk_${hashString(parts.join("|"))}`;
};
