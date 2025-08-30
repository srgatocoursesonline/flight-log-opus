import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function EnvDebugger() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Force re-render
  const refresh = () => setRefreshKey(prev => prev + 1);

  // Get environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const mode = import.meta.env.MODE;
  const baseUrl = import.meta.env.BASE_URL;
  
  // Get all VITE_ environment variables
  const viteVars = Object.keys(import.meta.env)
    .filter(key => key.startsWith('VITE_'))
    .map(key => ({ key, value: key.includes('KEY') ? '[SECRET]' : import.meta.env[key] }));
    
  // Get runtime debug information if available
  const envDebug = (window as any).__ENV_DEBUG__;

  return (
    <Card key={refreshKey} className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Environment Variables Debug
          <Button size="sm" variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          This component shows all environment variables available to the client.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Supabase Configuration</h3>
          
          <div className="flex items-center gap-2">
            {supabaseUrl ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>VITE_SUPABASE_URL: {supabaseUrl ? 'Available' : 'Missing'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {supabaseKey ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>VITE_SUPABASE_ANON_KEY: {supabaseKey ? 'Available' : 'Missing'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Vite Environment</h3>
          <p>MODE: {mode}</p>
          <p>BASE_URL: {baseUrl}</p>
        </div>

        {viteVars.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">All VITE_ Variables</h3>
            <ul className="list-disc pl-6 space-y-1">
              {viteVars.map(({ key, value }) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertTitle>No VITE_ variables found</AlertTitle>
            <AlertDescription>
              No environment variables with VITE_ prefix were detected.
            </AlertDescription>
          </Alert>
        )}

        {envDebug && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Build-time Information</h3>
            <pre className="bg-muted p-2 rounded-md overflow-auto text-xs">
              {JSON.stringify(envDebug, null, 2)}
            </pre>
          </div>
        )}
        
        <Alert>
          <AlertTitle>Troubleshooting</AlertTitle>
          <AlertDescription>
            <p>If variables are missing:</p>
            <ol className="list-decimal pl-6 space-y-1 text-sm">
              <li>Check if .env.local exists in project root</li>
              <li>Make sure variable names start with VITE_</li>
              <li>Restart the development server</li>
              <li>Clear browser cache and refresh</li>
              <li>Check vite.config.ts to ensure envDir is set correctly</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}