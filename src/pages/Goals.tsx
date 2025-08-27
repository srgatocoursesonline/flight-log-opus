import { Target, Plus, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Goals = () => {
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Career Goals
          </h1>
          <p className="text-muted-foreground">
            Set and track your career milestones and achievements.
          </p>
        </div>
        <Button variant="hud">
          <Plus className="h-4 w-4 mr-2" />
          Set New Goal
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="hud-display p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Active Goals</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">Reach CR 100</h4>
                <span className="text-sm text-primary font-medium">In Progress</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Achieve a perfect career rating of 100 points
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted/50 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
                <span className="text-sm font-mono text-foreground">94/100</span>
              </div>
            </div>
            
            <div className="p-4 bg-muted/20 rounded-lg border-l-4 border-accent">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">100 Flight Hours</h4>
                <span className="text-sm text-accent font-medium">In Progress</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Log 100 total flight hours this quarter
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted/50 rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <span className="text-sm font-mono text-foreground">72/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hud-display p-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="h-6 w-6 text-success" />
            <h3 className="text-lg font-semibold text-foreground">Completed Goals</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-success/10 rounded-lg border-l-4 border-success">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">First Solo Flight</h4>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">
                Complete your first flight without penalties
              </p>
              <p className="text-xs text-success mt-2">Completed 2 months ago</p>
            </div>
            
            <div className="p-4 bg-success/10 rounded-lg border-l-4 border-success">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">Atlantic Crossing</h4>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">
                Complete a transatlantic flight
              </p>
              <p className="text-xs text-success mt-2">Completed 3 weeks ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;