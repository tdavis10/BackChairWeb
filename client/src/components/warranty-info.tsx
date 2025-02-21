import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WarrantyInfo() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Comprehensive 5-Year Warranty
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Motor System</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>Full coverage for motor malfunction</li>
                <li>Free replacement parts</li>
                <li>Professional repair service</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Frame & Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>Lifetime structural integrity</li>
                <li>Weight capacity guarantee</li>
                <li>Anti-tip protection</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upholstery</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>Fabric quality assurance</li>
                <li>Wear and tear coverage</li>
                <li>Professional cleaning service</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
