import { Button } from "@/components/ui/button";
import { Download, Calendar, Filter } from "lucide-react";

const History = () => {
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Flight History
          </h1>
          <p className="text-muted-foreground">
            Complete record of all your flights with detailed analytics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="hud-display p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="font-semibold text-foreground">5 flights</p>
            </div>
          </div>
        </div>
        <div className="hud-display p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="font-semibold text-foreground">18 flights</p>
            </div>
          </div>
        </div>
        <div className="hud-display p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-semibold text-foreground">127 flights</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hud-display p-6">
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Flight history will appear here</h3>
          <p className="text-muted-foreground">
            Once you start logging flights, you'll see a detailed history with filters and export options.
          </p>
        </div>
      </div>
    </div>
  );
};

export default History;