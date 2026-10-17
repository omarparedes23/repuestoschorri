// Número en formato internacional, sin "+" ni espacios.
// Se configura con NEXT_PUBLIC_WHATSAPP_NUMBER (ver .env.example).
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51934892800";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://repuestoschorry.pe";

export const BUSINESS = {
  name: "RB Repuestos Chorry",
  slogan: "Repuestos en General - Calidad Garantizada",
  phone: "+51 934 892 800",
  address: "Av. Iquitos 116, Interior 228, La Victoria, Lima",
  url: SITE_URL,
  hours: [
    { days: "Lunes a Viernes", time: "8:00 a.m. – 7:00 p.m." },
    { days: "Sábados", time: "8:00 a.m. – 5:00 p.m." },
  ],
};
