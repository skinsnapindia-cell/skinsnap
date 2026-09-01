import type { Metadata } from "next";
import { Suspense } from "react";
import TrackPage from "./TrackPage";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Track your SkinSnap order. Enter your order reference number to see its status, courier and delivery progress.",
  alternates: { canonical: "/track" },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TrackPage />
    </Suspense>
  );
}
