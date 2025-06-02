'use client';
import { SessionProvider } from "next-auth/react";
import SessionExpiryDialog from "./SessionExpiryDialog";

export default function SessionExpiryDialogWrapper() {
  return (
    <SessionProvider>
      <SessionExpiryDialog />
    </SessionProvider>
  );
} 