import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeftIcon,
  MicIcon,
  MailIcon,
  UserIcon,
  BuildingIcon,
  BookOpenIcon,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { createSpeaker } from "@/app/actions/speaker-actions";

export default function NewSpeakerPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/speakers">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-accent"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Speaker</h1>
          <p className="text-muted-foreground">
            Expert profiles that will inspire your attendees.
          </p>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 shadow-xl backdrop-blur rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/30 p-8">
          <CardTitle className="text-xl">Speaker Information</CardTitle>
          <CardDescription>
            Fill in the details to create a new speaker profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form action={createSpeaker} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4 text-primary" /> Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Dr. Sarah Chen"
                  required
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <MailIcon className="h-4 w-4 text-primary" /> Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="sarah.chen@tech.com"
                  required
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="company"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <BuildingIcon className="h-4 w-4 text-primary" /> Company /
                  Organization
                </Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="TechVision AI"
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="topic"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <MicIcon className="h-4 w-4 text-primary" /> Keynote Topic
                </Label>
                <Input
                  id="topic"
                  name="topic"
                  placeholder="Future of LLMs in Enterprise"
                  required
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="avatar"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4 text-primary" /> Avatar URL
              </Label>
              <Input
                id="avatar"
                name="avatar"
                placeholder="https://images.unsplash.com/photo-..."
                className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
              />
              <p className="text-[11px] text-muted-foreground">
                Provide a link to a profile picture (square aspect ratio
                recommended).
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="bio"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <BookOpenIcon className="h-4 w-4 text-primary" /> Professional
                Biography
              </Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Write a short biography about the speaker's background and expertise..."
                required
                className="bg-background/50 border-border/50 rounded-xl min-h-[120px] focus:ring-primary/20"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link href="/speakers">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl px-6"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 shadow-lg shadow-primary/20"
              >
                Create Speaker Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
