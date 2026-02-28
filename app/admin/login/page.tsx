import { isAdminAuthenticated } from "../actions";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login - mdbin",
  robots: "noindex, nofollow",
};

export default async function AdminLoginPage() {
  const authed = await isAdminAuthenticated();

  if (authed) {
    redirect("/admin");
  }

  return (
    <main className="page-container">
      <AdminLoginForm />
    </main>
  );
}
