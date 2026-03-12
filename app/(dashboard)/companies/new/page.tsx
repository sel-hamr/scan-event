import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftIcon, Building2Icon, MailIcon, GlobeIcon, PhoneIcon, MapPinIcon, ImageIcon, AlignLeftIcon } from "lucide-react";
import Link from "next/link";
import { createCompany } from "@/app/actions/company-actions";

export default function NewCompanyPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/companies">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Company</h1>
          <p className="text-muted-foreground">Register a new organization to host events.</p>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 shadow-xl backdrop-blur rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/30 p-8">
          <CardTitle className="text-xl">Company Details</CardTitle>
          <CardDescription>Enter the official information for the organization.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form action={createCompany} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                  <Building2Icon className="h-4 w-4 text-primary" /> Company Name
                </Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="e.g. Acme Corporation" 
                  required 
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                  <MailIcon className="h-4 w-4 text-primary" /> Contact Email
                </Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="contact@acme.com" 
                  required 
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-semibold flex items-center gap-2">
                  <GlobeIcon className="h-4 w-4 text-primary" /> Website
                </Label>
                <Input 
                  id="website" 
                  name="website" 
                  placeholder="https://acme.com" 
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-primary" /> Phone Number
                </Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  placeholder="+1 (555) 000-0000" 
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-primary" /> Headquarters Address
              </Label>
              <Input 
                id="address" 
                name="address" 
                placeholder="123 Business Way, Suite 100, Innovation City" 
                className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo" className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" /> Logo URL
              </Label>
              <Input 
                id="logo" 
                name="logo" 
                placeholder="https://example.com/logo.png" 
                className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2">
                <AlignLeftIcon className="h-4 w-4 text-primary" /> Company Description
              </Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Describe the company's core business and mission..." 
                required 
                className="bg-background/50 border-border/50 rounded-xl min-h-[120px] focus:ring-primary/20"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link href="/companies">
                <Button type="button" variant="ghost" className="rounded-xl px-6">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 shadow-lg shadow-primary/20">
                Create Company
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
