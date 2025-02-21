
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export function Header() {
  const { user } = useAuth();
  
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <img src="/logo.png" alt="The Back Chair Logo" className="h-8" />
        </Link>
        
        <nav>
          {!user ? (
            <Link href="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
          ) : (
            <Link href="/profile">
              <Button variant="outline">My Profile</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
