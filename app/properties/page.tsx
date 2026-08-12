import { Suspense } from "react";
import { PropertiesExplorer } from "@/components/properties-explorer";
import { ResultsSkeleton } from "@/components/results-skeleton";

export default function PropertiesPage() { return <Suspense fallback={<ResultsSkeleton />}><PropertiesExplorer /></Suspense>; }
