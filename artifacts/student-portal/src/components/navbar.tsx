import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { Search, PlusCircle, LayoutDashboard, LogOut, ShieldAlert } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xl font-display">
              C
            </div>
            <span className="font-display font-bold text-xl hidden sm:inline-block">
              Campus<span className="text-primary">Finds</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-4">
            <Link href="/browse" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/browse' ? 'text-primary' : 'text-muted-foreground'}`}>
              Browse
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/browse">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" title="Search">
              <Search className="w-5 h-5" />
            </Button>
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/post">
                <Button className="hidden sm:flex gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Post Item
                </Button>
                <Button size="icon" className="sm:hidden">
                  <PlusCircle className="w-5 h-5" />
                </Button>
              </Link>
              
              <div className="h-6 w-px bg-border mx-1"></div>
              
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hidden lg:flex gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="hidden lg:flex gap-2 text-destructive">
                    <ShieldAlert className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
              
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
