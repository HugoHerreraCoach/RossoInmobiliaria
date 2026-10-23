import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { AnalyticsPanel } from "@/components/panel/AnalyticsPanel";
import "./panel.css";

// El panel conserva su tipografía y su estilo de enlaces: se cargan solo en esta ruta,
// así la landing no los descarga y el panel se ve igual que antes del rediseño.
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jakarta", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-outfit", display: "swap" });

export const metadata:Metadata={title:"Panel de rastros · Rosso",robots:{index:false,follow:false}};
export default function Panel(){return <div className={`panel-root ${jakarta.variable} ${outfit.variable}`}><AnalyticsPanel/></div>;}
