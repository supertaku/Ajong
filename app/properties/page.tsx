import { Suspense } from "react";
import { PropertiesExplorer } from "@/components/properties-explorer";

export default function PropertiesPage() { return <Suspense fallback={<div className="container page-title"><h1>Finding rentals</h1></div>}><PropertiesExplorer /></Suspense>; }
