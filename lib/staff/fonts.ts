// Persona display fonts for the staff header name lockup only. Imported only by the
// staff page. preload is off, so a browser downloads a face only when that persona's
// page actually uses it (one extra font per staff page at most).
import { Anton, Barlow_Condensed, Bebas_Neue, Inter, Roboto_Condensed, Special_Elite } from "next/font/google";
import type { StaffFontKey } from "./themes";

const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const barlow = Barlow_Condensed({ weight: "600", subsets: ["latin"], display: "swap", preload: false });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const roboto = Roboto_Condensed({ weight: "700", subsets: ["latin"], display: "swap", preload: false });
const inter = Inter({ weight: "600", subsets: ["latin"], display: "swap", preload: false });
const specialElite = Special_Elite({ weight: "400", subsets: ["latin"], display: "swap", preload: false });

export const STAFF_FONTS: Record<StaffFontKey, { className: string; style: { fontFamily: string } }> = {
  anton,
  "barlow-condensed": barlow,
  "bebas-neue": bebas,
  "roboto-condensed": roboto,
  "special-elite": specialElite,
  inter,
};
