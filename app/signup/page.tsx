"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/name-login");
  }, [router]);

  return null;
}



