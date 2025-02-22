import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ProductShowcase() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">The Future of Comfort</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Experience the next level of ergonomic seating with our motorized office chair. 
              Featuring advanced adjustment technology and premium materials for ultimate comfort.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full p-2 bg-primary/10">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Motorized Adjustment</h3>
                  <p className="text-muted-foreground">Perfect positioning at the touch of a button</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full p-2 bg-primary/10">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Memory Foam</h3>
                  <p className="text-muted-foreground">Superior comfort that adapts to you</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full p-2 bg-primary/10">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">5-Year Warranty</h3>
                  <p className="text-muted-foreground">Comprehensive coverage for peace of mind</p>
                </div>
              </div>
            </div>
            <Link href="/checkout">
              <Button size="lg" className="mt-8">
                Order Now - $1999
              </Button>
            </Link>
          </div>
          <div className="relative">
            <img
              src="/ChairFront.png"
              alt="The Back Chair"
              className="w-full max-w-lg mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
