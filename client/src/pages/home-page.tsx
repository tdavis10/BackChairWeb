import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProductShowcase from "@/components/product-showcase";
import WarrantyInfo from "@/components/warranty-info";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">The Back Chair</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/support">
                  <Button variant="ghost">Support</Button>
                </Link>
                <Link href="/checkout">
                  <Button>Buy Now</Button>
                </Link>
              </>
            ) : (
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main>
        <ProductShowcase />
        <WarrantyInfo />
        
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Technical Specifications</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Motor System</h3>
                <p>Advanced dual-motor system for precise adjustments</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Materials</h3>
                <p>Premium mesh back with memory foam seat cushion</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Weight Capacity</h3>
                <p>Supports up to 300 lbs with robust construction</p>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
