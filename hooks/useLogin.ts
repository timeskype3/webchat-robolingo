"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase-client";

export function useLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch {
      setError("Sign-in failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  }

  return { email, setEmail, password, setPassword, loading, error, handleSubmit };
}
