'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authApi } from '@/lib/api';

type VerifyState = 'loading' | 'success' | 'error' | 'missing';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [state, setState] = useState<VerifyState>(token ? 'loading' : 'missing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setState('missing');
      return;
    }

    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        setState('success');
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Verification failed. The link may have expired.';
        setErrorMsg(msg);
        setState('error');
      }
    };

    verify();
  }, [token]);

  return (
    <Card>
      {state === 'loading' && (
        <>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <CardTitle className="text-center">Verifying your email...</CardTitle>
            <CardDescription className="text-center">
              Just a moment while we confirm your email address.
            </CardDescription>
          </CardHeader>
        </>
      )}

      {state === 'success' && (
        <>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <CardTitle className="text-center">Email Verified!</CardTitle>
            <CardDescription className="text-center">
              Your email has been confirmed. You can now sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/login')}>
              Continue to Sign In
            </Button>
          </CardContent>
        </>
      )}

      {state === 'error' && (
        <>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-center">Verification Failed</CardTitle>
            <CardDescription className="text-center">
              {errorMsg}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Verification links expire after 24 hours. Try registering again or contact support.
            </p>
            <Button variant="outline" className="w-full" onClick={() => router.push('/register')}>
              Back to Register
            </Button>
            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Already verified? Sign in
              </Link>
            </div>
          </CardContent>
        </>
      )}

      {state === 'missing' && (
        <>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <CardTitle className="text-center">No Token Found</CardTitle>
            <CardDescription className="text-center">
              This page requires a valid verification token from your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Please click the verification link in the email we sent you after registration.
            </p>
            <Button variant="outline" className="w-full" onClick={() => router.push('/register')}>
              Register Again
            </Button>
          </CardContent>
        </>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">MarketIntel AI</h1>
          <p className="text-sm text-muted-foreground">Email Verification</p>
        </div>
        <Suspense fallback={<div className="h-48 animate-pulse bg-card rounded-lg" />}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
