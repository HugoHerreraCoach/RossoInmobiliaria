import type { Metadata } from "next";
import { AnalyticsPanel } from "@/components/panel/AnalyticsPanel";
import "./panel.css";
export const metadata:Metadata={title:"Panel de rastros · Rosso",robots:{index:false,follow:false}};
export default function Panel(){return <AnalyticsPanel/>;}
