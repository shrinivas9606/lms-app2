// src/app/dashboard/admin/inquiries/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function InquiriesPage() {
  const supabase = await createClient();

  // Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard/student');

  // Fetch all contact inquiries
  const { data: inquiries, error } = await supabase
    .from('contact_inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching inquiries:", error);
  }

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Inquiries</h1>
        <p className="text-muted-foreground">Messages submitted through the website contact form.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>
            A list of all user messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries && inquiries.length > 0 ? (
                inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      <div className="font-medium">{inquiry.name}</div>
                      <div className="text-sm text-muted-foreground">{inquiry.email}</div>
                    </TableCell>
                    <TableCell className="max-w-md whitespace-pre-wrap">{inquiry.message}</TableCell>
                    <TableCell>
                      {new Date(inquiry.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* We use a mailto link to open the user's default email client */}
                      <a href={`mailto:${inquiry.email}`}>
                        <Button variant="outline">Reply</Button>
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No inquiries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
