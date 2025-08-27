import { User, Edit, Star, Calendar, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Pilot Profile
          </h1>
          <p className="text-muted-foreground">
            Your career information and achievements.
          </p>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="hud-display p-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Captain Smith</h3>
            <p className="text-sm text-muted-foreground mb-4">Professional Pilot</p>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-4 w-4 text-accent fill-current" />
              <span className="font-bold text-accent font-mono">CR 94</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground font-mono">127</p>
                <p className="text-xs text-muted-foreground uppercase">Flights</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground font-mono">348</p>
                <p className="text-xs text-muted-foreground uppercase">Hours</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 hud-display p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Career Statistics</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h4 className="font-medium text-foreground">Career Started</h4>
              </div>
              <p className="text-sm text-muted-foreground">January 15, 2024</p>
              <p className="text-xs text-muted-foreground mt-1">8 months ago</p>
            </div>
            
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-accent" />
                <h4 className="font-medium text-foreground">Total Flight Time</h4>
              </div>
              <p className="text-sm text-muted-foreground">348 hours 25 minutes</p>
              <p className="text-xs text-muted-foreground mt-1">Average: 43h/month</p>
            </div>
            
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-5 w-5 text-success" />
                <h4 className="font-medium text-foreground">Achievements</h4>
              </div>
              <p className="text-sm text-muted-foreground">15 unlocked</p>
              <p className="text-xs text-muted-foreground mt-1">5 in progress</p>
            </div>
            
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Star className="h-5 w-5 text-warning" />
                <h4 className="font-medium text-foreground">Perfect Flights</h4>
              </div>
              <p className="text-sm text-muted-foreground">23 flights</p>
              <p className="text-xs text-muted-foreground mt-1">18% success rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hud-display p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Recent Achievements</h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-5 w-5 text-success" />
              <h4 className="font-medium text-foreground">Atlantic Crossing</h4>
            </div>
            <p className="text-sm text-muted-foreground">Completed a transatlantic flight</p>
            <p className="text-xs text-success mt-2">Unlocked 3 weeks ago</p>
          </div>
          
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <Star className="h-5 w-5 text-primary" />
              <h4 className="font-medium text-foreground">High Performer</h4>
            </div>
            <p className="text-sm text-muted-foreground">Maintained CR above 90 for 30 days</p>
            <p className="text-xs text-primary mt-2">Unlocked 1 month ago</p>
          </div>
          
          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-accent" />
              <h4 className="font-medium text-foreground">Century Club</h4>
            </div>
            <p className="text-sm text-muted-foreground">Completed 100+ flights</p>
            <p className="text-xs text-accent mt-2">Unlocked 2 months ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;