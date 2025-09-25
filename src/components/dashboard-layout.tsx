

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ListTodo, Target, Repeat, Swords, Users, MoreHorizontal, Home } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getAuth, signOut, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { app, isFirebaseConfigured } from '@/lib/firebase';
import React, { useEffect, useState } from 'react';


const auth = isFirebaseConfigured ? getAuth(app) : undefined;

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/habits', label: 'Habits', icon: Repeat },
  { href: '/competitions', label: 'Competitions', icon: Swords },
  { href: '/social', label: 'Social', icon: Users },
];

const mobileNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tasks', label: 'Tasks', icon: ListTodo },
    { href: '/goals', label: 'Goals', icon: Target },
];

function MainNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === path;
    if (path === '/dashboard') return pathname === path;
    return pathname.startsWith(path) && path !== '/';
  };
  
  return (
    <SidebarMenu className="gap-2 ml-4">
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton 
            asChild 
            isActive={isActive(item.href)}
            size="lg"
            tooltip={{
              children: item.label,
              className: "bg-primary text-primary-foreground",
            }}
          >
            <Link href={item.href}>
              <item.icon className="size-6 mr-4" />
              <span className={isActive(item.href) ? 'text-white' : 'text-muted-foreground group-hover/menu-item:text-white'}>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function MobileBottomNav() {
    const pathname = usePathname();
    const { toggleSidebar } = useSidebar();
    
    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === path;
        return pathname.startsWith(path) && path !== '/';
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border/50 p-2 md:hidden z-20">
            <div className="flex justify-around items-center h-full">
                {mobileNavItems.map((item) => (
                    <Link href={item.href} key={item.href} className={`flex flex-col items-center justify-center w-full ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}`}>
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}
                <button onClick={toggleSidebar} className="flex flex-col items-center justify-center w-full text-muted-foreground">
                    <MoreHorizontal className="h-6 w-6" />
                    <span className="text-xs">More</span>
                </button>
            </div>
        </div>
    )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(auth?.currentUser || null);

  useEffect(() => {
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
      });
      return () => unsubscribe();
    }
  }, []);

  const handleSignOut = async () => {
    if (!auth) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Firebase is not configured. Cannot sign out.',
        });
        return;
    }
    try {
      await signOut(auth);
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
      });
    }
  };


  const pageTitle = (pathname: string) => {
    if (pathname === '/') return 'Home';
    if (pathname === '/dashboard') return 'Dashboard';
    const title = pathname.substring(1).split('/')[0];
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  // If we are on the new landing page, don't render the sidebar or normal layout
  if (pathname === '/') {
    return <main>{children}</main>;
  }
  
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2 ml-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.photoURL || "https://placehold.co/40x40.png"} alt="@user" data-ai-hint="profile avatar" />
              <AvatarFallback>{user?.displayName?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium text-white">{user?.displayName || 'Aivo User'}</span>
              {user ? (
                 <Button variant="link" onClick={handleSignOut} className="h-auto p-0 text-xs text-muted-foreground justify-start">Logout</Button>
              ) : (
                <Button variant="link" asChild className="h-auto p-0 text-xs text-muted-foreground justify-start">
                  <Link href="/imam">Login</Link>
                </Button>
              )}
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-6 backdrop-blur-sm">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold font-headline text-white">
            {pageTitle(pathname)}
          </h1>
        </header>
        <div className="flex-1 p-6 mb-16 md:mb-0">{children}</div>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}

    