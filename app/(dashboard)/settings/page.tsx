"use client";

import { currentUser } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  const initials = currentUser.name.split(" ").map(n => n[0]).join("");

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and platform preferences.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile" className="rounded-lg h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Profile</TabsTrigger>
          <TabsTrigger value="account" className="rounded-lg h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Account</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Notifications</TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 outline-none focus-visible:ring-0 blur-none transition-all">
          <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>This is how others will see you on the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 flex flex-col sm:flex-row gap-8">
              <div className="flex flex-col items-center gap-4 w-full sm:w-1/3 p-6 border border-border/50 rounded-xl bg-background shadow-inner">
                <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-lg">{currentUser.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{currentUser.role.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-2 w-full mt-2">
                  <Button variant="outline" className="w-full rounded-xl">Change</Button>
                  <Button variant="ghost" className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10">Remove</Button>
                </div>
              </div>

              <div className="space-y-4 w-full sm:w-2/3">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={currentUser.name} className="rounded-xl bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={currentUser.email} disabled className="rounded-xl bg-muted" />
                  <p className="text-[10px] text-muted-foreground mt-1 px-1">Email changes require email verification.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Write a short bio about yourself" className="rounded-xl bg-background min-h-[100px] resize-none" defaultValue="Managing high-visibility tech conferences and driving user engagement." />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end gap-3">
              <Button variant="ghost" className="rounded-xl">Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90 rounded-xl">Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 outline-none focus-visible:ring-0">
          <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle>Appearance & Theme</CardTitle>
              <CardDescription>Customize how the dashboard looks and feels to you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background shadow-inner">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Platform defaults to dark mode. You can toggle it off for light UI.</p>
                </div>
                <Switch defaultChecked={true} className="data-[state=checked]:bg-primary" />
              </div>

              <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background shadow-inner">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Sidebar Behavior</Label>
                  <p className="text-sm text-muted-foreground">Automatically collapse sidebar on smaller screens.</p>
                </div>
                <Switch defaultChecked={true} className="data-[state=checked]:bg-primary" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
