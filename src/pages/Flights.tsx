import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Plane } from "lucide-react";

const Flights = () => {
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Flight Management
          </h1>
          <p className="text-muted-foreground">
            Manage your flight operations and log new missions.
          </p>
        </div>
        <Button variant="hud">
          <Plus className="h-4 w-4 mr-2" />
          Log New Flight
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search flights..."
            className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="hud-display p-6">
        <div className="text-center py-12">
          <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No flights logged yet</h3>
          <p className="text-muted-foreground mb-6">Start by logging your first flight to begin tracking your career progression.</p>
          <Button variant="hud">
            <Plus className="h-4 w-4 mr-2" />
            Log Your First Flight
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Flights;