import { Button } from '@/components/ui/button';
import { SupabaseConnectionTest } from "@/components/debug/SupabaseConnectionTest";
import { SupabaseSwitcher } from "@/components/debug/SupabaseSwitcher";

export default function Diagnostic() {
  return (
    <div className="container mx-auto px-6 pt-8 pb-6 space-y-6">
      <h1 className="mobile-title gradient-title">Diagnóstico do Sistema</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <SupabaseConnectionTest />
        <SupabaseSwitcher />
      </div>
      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Acesso ao Diagnóstico Avançado</h2>
        <p>Para um diagnóstico mais detalhado, acesse <a href="/super-diagnostic" className="text-primary hover:underline">Super Diagnóstico</a>.</p>
      </div>
    </div>
  );
}
