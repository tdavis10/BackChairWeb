import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SupportForm from "@/components/support-form";
import { useQuery } from "@tanstack/react-query";
import { SupportTicket } from "@shared/schema";

export default function SupportPage() {
  const { data: tickets = [] } = useQuery<SupportTicket[]>({ 
    queryKey: ["/api/tickets"]
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Support Center</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <SupportForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <p className="text-muted-foreground">No support tickets yet.</p>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{ticket.type}</h3>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      <time className="text-xs text-muted-foreground mt-2 block">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}