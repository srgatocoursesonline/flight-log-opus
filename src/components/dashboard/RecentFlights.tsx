import { Plane, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockFlights = [
  {
    id: 1,
    from: "KJFK",
    to: "EGLL",
    aircraft: "A320neo",
    date: "2024-08-27",
    duration: "7h 32m",
    cr: 95,
    status: "completed"
  },
  {
    id: 2,
    from: "EGLL",
    to: "LFPG",
    aircraft: "B737-800",
    date: "2024-08-26",
    duration: "1h 15m",
    cr: 88,
    status: "completed"
  },
  {
    id: 3,
    from: "LFPG",
    to: "EDDF",
    aircraft: "A321",
    date: "2024-08-25",
    duration: "1h 45m",
    cr: 92,
    status: "completed"
  },
];

export const RecentFlights = () => {
  return (
    <div className="hud-display p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Recent Flights</h3>
          <p className="text-sm text-muted-foreground">Your latest flight activities</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {mockFlights.map((flight) => (
          <div key={flight.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="rounded-lg bg-primary/10 p-3">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground font-mono">{flight.from}</span>
                <div className="h-px flex-1 bg-border" />
                <Plane className="h-3 w-3 text-muted-foreground" />
                <div className="h-px flex-1 bg-border" />
                <span className="font-semibold text-foreground font-mono">{flight.to}</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {flight.aircraft}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {flight.duration}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-accent font-mono">
                {flight.cr}
              </div>
              <div className="text-xs text-muted-foreground uppercase">
                CR
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};