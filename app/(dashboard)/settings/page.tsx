"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSidebarStore } from "@/stores";
import { UploadCloudIcon, XCircleIcon } from "lucide-react";
import {
  DEFAULT_APPEARANCE_PREFS,
  getAppearancePrefsFromCookie,
  setAppearancePrefsCookie,
} from "@/lib/appearance-cookie";

export default function SettingsPage() {
  const { setCollapsed } = useSidebarStore();
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
  } | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    avatar: "",
    bio: "",
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notificationPrefs, setNotificationPrefs] = useState({
    eventUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
  });
  const [appearancePrefs, setAppearancePrefs] = useState({
    darkMode: true,
    autoCollapseSidebar: true,
  });
  const [appearanceLoaded, setAppearanceLoaded] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setProfileForm((prev) => ({ ...prev, avatar: base64 }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/me", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      setUser(payload.user);
      setProfileForm({
        name: payload.user.name ?? "",
        phone: payload.user.phone ?? "",
        avatar: payload.user.avatar ?? "",
        bio: "Managing high-visibility tech conferences and driving user engagement.",
      });
    };

    load();
  }, []);

  useEffect(() => {
    const storedNotifications = localStorage.getItem("settings:notifications");
    if (storedNotifications) {
      try {
        setNotificationPrefs(JSON.parse(storedNotifications));
      } catch {
        localStorage.removeItem("settings:notifications");
      }
    }

    setAppearancePrefs(getAppearancePrefsFromCookie());

    setAppearanceLoaded(true);
  }, []);

  useEffect(() => {
    if (!appearanceLoaded) return;

    document.documentElement.classList.toggle("dark", appearancePrefs.darkMode);

    if (appearancePrefs.autoCollapseSidebar) {
      setCollapsed(window.innerWidth < 768);
    }
  }, [appearanceLoaded, appearancePrefs, setCollapsed]);

  const saveProfile = async () => {
    setProfileLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          avatar: profileForm.avatar,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Failed to update profile.");
        return;
      }

      setUser(payload.user);
      setMessage("Profile updated successfully.");
    } catch {
      setError("Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const updatePassword = async () => {
    setSecurityLoading(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "Failed to update password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated successfully.");
    } catch {
      setError("Failed to update password.");
    } finally {
      setSecurityLoading(false);
    }
  };

  const savePreferences = () => {
    setPreferencesLoading(true);
    setMessage(null);
    setError(null);
    try {
      localStorage.setItem(
        "settings:notifications",
        JSON.stringify(notificationPrefs),
      );
      setAppearancePrefsCookie(appearancePrefs);

      document.documentElement.classList.toggle(
        "dark",
        appearancePrefs.darkMode,
      );
      if (appearancePrefs.autoCollapseSidebar) {
        setCollapsed(window.innerWidth < 768);
      }

      setMessage("Preferences saved successfully.");
    } catch {
      setError("Failed to save preferences.");
    } finally {
      setPreferencesLoading(false);
    }
  };

  if (!user) {
    return <div className="text-muted-foreground">Loading settings...</div>;
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and platform preferences.
          </p>
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full justify-start overflow-x-auto">
          <TabsTrigger
            value="profile"
            className="rounded-lg h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="rounded-lg h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-lg h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="rounded-lg h-10 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="profile"
          className="space-y-6 outline-none focus-visible:ring-0 blur-none transition-all"
        >
          <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 flex flex-col sm:flex-row gap-8">
              <div className="flex flex-col items-center gap-4 w-full sm:w-1/3 p-6 border border-border/50 rounded-xl bg-background shadow-inner">
                <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl">
                  <AvatarImage src={profileForm.avatar || user.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {user.role.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="space-y-4 w-full sm:w-2/3">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="rounded-xl bg-muted"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 px-1">
                    Email changes require email verification.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+212 6 12 34 56 78"
                    className="rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                  />
                  {profileForm.avatar ? (
                    <div className="relative w-full overflow-hidden rounded-xl border border-border/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profileForm.avatar}
                        alt="Avatar preview"
                        className="h-40 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProfileForm((prev) => ({ ...prev, avatar: "" }))
                        }
                        className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-destructive shadow-sm backdrop-blur hover:bg-background"
                        aria-label="Remove image"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-2 right-2 rounded-lg bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur hover:bg-background"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          handleAvatarUpload(file);
                        }
                      }}
                      className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/50 bg-muted/20 px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
                    >
                      <UploadCloudIcon className="h-10 w-10 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF, WEBP up to any size
                        </p>
                      </div>
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Write a short bio about yourself"
                    className="rounded-xl bg-background min-h-25 resize-none"
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end gap-3">
              <Button
                variant="ghost"
                className="rounded-xl"
                onClick={() =>
                  setProfileForm((prev) => ({
                    ...prev,
                    name: user.name,
                    phone: user.phone || "",
                    avatar: user.avatar || "",
                  }))
                }
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 rounded-xl"
                onClick={saveProfile}
                disabled={profileLoading}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent
          value="account"
          className="space-y-6 outline-none focus-visible:ring-0"
        >
          <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Manage your password and active sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    className="rounded-xl bg-background"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    className="rounded-xl bg-background"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-background p-4">
                <p className="font-medium mb-1">Active Session</p>
                <p className="text-sm text-muted-foreground">
                  Signed in as {user.email}
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end gap-3">
              <Button variant="ghost" className="rounded-xl">
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 rounded-xl"
                onClick={updatePassword}
                disabled={securityLoading}
              >
                Update Security
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent
          value="notifications"
          className="space-y-6 outline-none focus-visible:ring-0"
        >
          <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which updates you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background shadow-inner">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">
                    Event Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    New registrations, ticket sales, and event status changes.
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs.eventUpdates}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs((prev) => ({
                      ...prev,
                      eventUpdates: checked,
                    }))
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background shadow-inner">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">
                    Marketing Emails
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Product announcements and platform news.
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs.marketingEmails}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs((prev) => ({
                      ...prev,
                      marketingEmails: checked,
                    }))
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background shadow-inner">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">
                    Security Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Sign-in attempts and security-related account events.
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs.securityAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationPrefs((prev) => ({
                      ...prev,
                      securityAlerts: checked,
                    }))
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end gap-3">
              <Button
                variant="ghost"
                className="rounded-xl"
                onClick={() =>
                  setNotificationPrefs({
                    eventUpdates: true,
                    marketingEmails: false,
                    securityAlerts: true,
                  })
                }
              >
                Reset
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 rounded-xl"
                onClick={savePreferences}
                disabled={preferencesLoading}
              >
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent
          value="appearance"
          className="space-y-6 outline-none focus-visible:ring-0"
        >
          <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle>Appearance & Theme</CardTitle>
              <CardDescription>
                Customize how the dashboard looks and feels to you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background shadow-inner">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Platform defaults to dark mode. You can toggle it off for
                    light UI.
                  </p>
                </div>
                <Switch
                  checked={appearancePrefs.darkMode}
                  onCheckedChange={(checked) =>
                    setAppearancePrefs((prev) => ({
                      ...prev,
                      darkMode: checked,
                    }))
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background shadow-inner">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">
                    Sidebar Behavior
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically collapse sidebar on smaller screens.
                  </p>
                </div>
                <Switch
                  checked={appearancePrefs.autoCollapseSidebar}
                  onCheckedChange={(checked) =>
                    setAppearancePrefs((prev) => ({
                      ...prev,
                      autoCollapseSidebar: checked,
                    }))
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end gap-3">
              <Button
                variant="ghost"
                className="rounded-xl"
                onClick={() =>
                  setAppearancePrefs({
                    darkMode: true,
                    autoCollapseSidebar: true,
                  })
                }
              >
                Reset
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 rounded-xl"
                onClick={savePreferences}
                disabled={preferencesLoading}
              >
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
