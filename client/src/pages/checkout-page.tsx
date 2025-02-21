import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CheckoutForm from "@/components/checkout-form";
import { useAuth } from "@/hooks/use-auth";

export default function CheckoutPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <img
                        src="/ChairFront.png"
                        alt="The Back Chair"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold">The Back Chair</h3>
                        <p className="text-sm text-muted-foreground">
                          Premium Motorized Office Chair
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">$999.00</p>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>$999.00</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg mt-4 border-t pt-4">
                      <span>Total</span>
                      <span>$999.00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Included with Your Purchase</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      5-Year Comprehensive Warranty
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Free Professional Assembly
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      30-Day Money Back Guarantee
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <CheckoutForm 
                    userEmail={user?.email ?? ''}
                    amount={99900} // in cents
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
