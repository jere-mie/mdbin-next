import { isAdminAuthenticated } from "./actions";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - mdbin",
  robots: "noindex, nofollow",
};

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    redirect("/admin/login");
  }

  return (
    <main className="page-container">
      <AdminDashboard />
    </main>
  );
}
