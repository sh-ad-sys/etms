"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/*
  This file ONLY decides where to send the user.
  It should NOT contain UI.
*/

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    // 🔥 Replace with real session later
    const role = "staff"; 

    if (role === "staff") {
      router.replace("/dashboard/staff");
    } else if (role === "supervisor") {
      router.replace("/dashboard/supervisor");
    } else if (role === "manager") {
      router.replace("/dashboard/manager");
    } else if (role === "hr") {
      router.replace("/dashboard/hr");
    } else if (role === "admin") {
      router.replace("/dashboard/admin");
    }
  }, [router]);

  return null;
}
