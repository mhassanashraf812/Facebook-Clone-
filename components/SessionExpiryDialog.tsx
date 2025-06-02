'use client';
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export default function SessionExpiryDialog() {
  const { data: session, status } = useSession();
  const [show, setShow] = useState(false);
  const wasLoggedIn = useRef(false);

  useEffect(() => {
    if (status === "authenticated") {
      wasLoggedIn.current = true;
      setShow(false);
    }
    if (status === "unauthenticated" && wasLoggedIn.current) {
      setShow(true);
      wasLoggedIn.current = false;
    }
  }, [status]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
        <h2 className="text-xl font-bold mb-4">Session Expired</h2>
        <p className="mb-6">Your session has expired. Please log in again.</p>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => (window.location.href = "/auth")}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
} 