"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyToken } = useAuth();
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided");
      return;
    }

    async function verify() {
      try {
        const response = await verifyToken(token);
        if (response.success) {
          setStatus("success");
          setTimeout(() => {
            router.push("/(student)/dashboard");
          }, 1500);
        } else {
          setStatus("error");
          setErrorMessage("Invalid or expired token");
        }
      } catch {
        setStatus("error");
        setErrorMessage("Verification failed. Please try again.");
      }
    }

    verify();
  }, [searchParams, verifyToken, router]);

  return (
    <>
      <CardContent className="text-center py-8">
        <CardTitle className="mb-4">
          {status === "loading" && "Verifying..."}
          {status === "success" && "Success!"}
          {status === "error" && "Verification Failed"}
        </CardTitle>

        {status === "loading" && (
          <div className="flex justify-center mb-4">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {status === "success" && (
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        {status === "error" && (
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )}

        <p className="text-slate-600">
          {status === "loading" && "Please wait while we verify your email..."}
          {status === "success" && "Redirecting to your dashboard..."}
          {status === "error" && errorMessage}
        </p>
      </CardContent>

      {status === "error" && (
        <div className="px-6 pb-6">
          <Button
            onClick={() => router.push("/auth/login")}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      )}
    </>
  );
}
