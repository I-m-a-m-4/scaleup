'use client';

import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { app, isFirebaseConfigured } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// IMPORTANT: Add your admin email to the .env file
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';

// Only initialize auth if Firebase is configured
const auth = isFirebaseConfigured ? getAuth(app) : undefined;
const provider = isFirebaseConfigured ? new GoogleAuthProvider() : undefined;

export default function ImamAdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setLoading(false);
      if (currentUser) {
        setUser(currentUser);
        if (ADMIN_EMAIL && currentUser.email === ADMIN_EMAIL) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          toast({
            variant: 'destructive',
            title: 'Unauthorized Access',
            description: 'You are not authorized to view this page.',
          });
          // Sign out the user if they are not the admin
          if (auth) {
            auth.signOut();
          }
        }
      } else {
        setUser(null);
        setIsAuthorized(false);
      }
    });

    if (!ADMIN_EMAIL) {
      console.error("Admin email is not configured. Please set NEXT_PUBLIC_ADMIN_EMAIL in your .env file.");
      if (isFirebaseConfigured) {
        toast({
          variant: 'destructive',
          title: 'Configuration Error',
          description: 'Admin email is not set. Please contact support.',
          duration: 5000,
        });
      }
    }


    return () => unsubscribe();
  }, [toast]);

  const handleSignIn = async () => {
    if (!isFirebaseConfigured || !auth || !provider) {
        toast({
            variant: 'destructive',
            title: 'Firebase Not Configured',
            description: 'Please add your Firebase credentials to the .env file to enable authentication.',
        });
        return;
    }

    if (!ADMIN_EMAIL) {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Cannot sign in because the admin email is not configured in the application.',
      });
      return;
    }
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error during sign-in:', error);
      
      let description = 'Could not sign in with Google. Please try again.';
      if (error.code === 'auth/invalid-api-key' || error.code === 'auth/missing-api-key') {
        description = 'Firebase API Key is invalid or missing. Please check your application configuration in the .env file.';
      }

      toast({
        variant: 'destructive',
        title: 'Sign-in Failed',
        description: description,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
             <Skeleton className="h-8 w-48" />
             <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
             <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isFirebaseConfigured) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-background">
        <Card className="w-full max-w-md p-4 text-center border-2 border-destructive/50 shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
              <Shield className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">Firebase Not Configured</CardTitle>
            <CardDescription>
              This page requires a Firebase connection, but the configuration details are missing. Please add your Firebase project keys to the <strong>.env</strong> file in the root of your project.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-background">
        <Card className="w-full max-w-md p-4 text-center border-2 border-primary/50 shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">Admin Access Required</CardTitle>
            <CardDescription>
              This page is restricted to authorized administrators only. Please sign in with an admin account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignIn} size="lg" className="w-full">
              <LogIn className="mr-2" />
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Welcome, Imam!</h1>
      <p className="text-muted-foreground">This is your admin dashboard.</p>
      {/* Admin content goes here */}
    </div>
  );
}
