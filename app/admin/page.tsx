import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin · Orders",
  // Never let the admin area be indexed or followed by crawlers.
  robots: { index: false, follow: false, nocache: true },
};

export default function Page() {
  return <AdminDashboard />;
}
