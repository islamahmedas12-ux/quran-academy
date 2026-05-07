import { CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MagicLinkSentPage() {
  return (
    <>
      <CardContent className="text-center py-8">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <CardTitle className="mb-2">Check Your Email</CardTitle>
        <CardDescription className="text-base">
          We&apos;ve sent a magic link to your email address. Click the link in
          the email to sign in to your account.
        </CardDescription>
      </CardContent>

      <div className="px-6 pb-6">
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-slate-600">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              try again
            </Link>
            .
          </p>
        </div>

        <Link href="/auth/login">
          <Button variant="outline" className="w-full">
            Back to Login
          </Button>
        </Link>
      </div>
    </>
  );
}
