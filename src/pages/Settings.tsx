import { Settings as SettingsIcon, Bell, Shield, Database, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your app preferences and account settings.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="hud-display p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Flight Reminders</h4>
                <p className="text-sm text-muted-foreground">Get notified about upcoming flights</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Goal Progress</h4>
                <p className="text-sm text-muted-foreground">Updates on your career goals</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Achievement Unlocked</h4>
                <p className="text-sm text-muted-foreground">Celebrate your accomplishments</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="hud-display p-6">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="h-6 w-6 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">App Preferences</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Offline Mode</h4>
                <p className="text-sm text-muted-foreground">Cache data for offline use</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Auto-sync</h4>
                <p className="text-sm text-muted-foreground">Automatically sync when online</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Analytics</h4>
                <p className="text-sm text-muted-foreground">Help improve the app with usage data</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        <div className="hud-display p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-6 w-6 text-success" />
            <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Export Data</h4>
                <p className="text-sm text-muted-foreground">Download your flight data</p>
              </div>
              <Button variant="outline" size="sm">Export</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Backup</h4>
                <p className="text-sm text-muted-foreground">Create a backup of your data</p>
              </div>
              <Button variant="outline" size="sm">Backup</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground text-destructive">Reset Data</h4>
                <p className="text-sm text-muted-foreground">Permanently delete all flight data</p>
              </div>
              <Button variant="destructive" size="sm">Reset</Button>
            </div>
          </div>
        </div>

        <div className="hud-display p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-warning" />
            <h3 className="text-lg font-semibold text-foreground">Privacy & Security</h3>
          </div>
          
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Security features will be available when you connect to Supabase for backend functionality.
            </p>
            <Button variant="hud">
              Connect Supabase
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;