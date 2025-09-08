import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User, Calendar, Trophy, Star, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSupabaseFinancial } from "@/hooks/supabase/useSupabaseFinancial";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/ui/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useProfileFinancialSync } from "@/hooks/useProfileFinancialSync";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData?: {
    display_name: string;
    avatar_url?: string;
    initial_flights: number;    // Mudança: usar initial_flights
    initial_minutes: number;    // Mudança: initial_hours -> initial_minutes
    career_started?: string;
    achievements?: string;
    perfect_flights?: number;
    description?: string;
  };
}

export const EditProfileModal = ({ isOpen, onClose, profileData }: EditProfileModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { getFinancialStats } = useSupabaseFinancial();
  const { updateProfile } = useProfile();
  
  // Sincronização automática do career_rating com lucro líquido
  const { currentNetProfit } = useProfileFinancialSync();

  // Definindo tipos para o estado
  type FormData = {
    display_name: string;
    avatar_url: string;
    initial_flights: number;
    initial_minutes: number;
    career_started: string;
    achievements: string;
    perfect_flights: number;
    description: string;
  };

  const [formData, setFormData] = useState<FormData>({
    display_name: profileData?.display_name || "Cmdte. Rodrigo",
    avatar_url: profileData?.avatar_url || "",
    initial_flights: profileData?.initial_flights || 0,
    initial_minutes: profileData?.initial_minutes || 0,
    career_started: profileData?.career_started || new Date().toISOString().split('T')[0],
    achievements: profileData?.achievements || "",
    perfect_flights: profileData?.perfect_flights || 0,
    description: profileData?.description || ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [financialStats, setFinancialStats] = useState({
    flightStats: { totalFlights: 0, totalFlightTime: 0 },
    netProfit: 0
  });

  // Atualizar formData apenas quando o modal abre pela primeira vez
  useEffect(() => {
    if (profileData && isOpen) {
      setFormData({
        display_name: profileData.display_name || "Cmdte. Rodrigo",
        avatar_url: profileData.avatar_url || "",
        initial_flights: profileData.initial_flights || 0,
        initial_minutes: profileData.initial_minutes || 0,
        career_started: profileData.career_started || new Date().toISOString().split('T')[0],
        achievements: profileData.achievements || "",
        perfect_flights: profileData.perfect_flights || 0,
        description: profileData.description || ""
      });
    }
  }, [isOpen]); // Remover profileData das dependências para evitar sobrescrever durante edição

  // Carregar estatísticas financeiras apenas quando o modal abrir
  useEffect(() => {
    if (isOpen && user?.id) {
      try {
        const stats = getFinancialStats(); // getFinancialStats não aceita parâmetros
        setFinancialStats(stats);
      } catch (error) {
        // Error handling without console.log
      }
    }
  }, [isOpen, user?.id, getFinancialStats]); // Manter getFinancialStats nas dependências

  // Calcular CR dinâmico baseado no lucro líquido
  const dynamicCR = Math.max(0, Math.floor(currentNetProfit / 1000));

  // Função para formatar CR
  const formatCR = (cr: number) => {
    return cr.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handleAvatarUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      // Upload do arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));
      
      toast({
        title: "Sucesso!",
        description: "Avatar atualizado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload do avatar",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile({
        display_name: formData.display_name,
        avatar_url: formData.avatar_url,
        initial_flights: formData.initial_flights,
        initial_minutes: formData.initial_minutes, // Manter em minutos
        career_started: formData.career_started,
        achievements: formData.achievements,
        perfect_flights: formData.perfect_flights,
        description: formData.description,
        career_rating: dynamicCR
      });

      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('profile.edit.title', 'Editar Perfil')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.avatar_url} alt={formData.display_name} />
              <AvatarFallback className="text-2xl">
                {formData.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Alterar Avatar
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Básicas
            </h3>

            <div className="space-y-2">
              <Label htmlFor="display_name">Nome de Exibição</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Cmdte. Rodrigo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Conte um pouco sobre sua experiência como piloto..."
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Star className="h-5 w-5" />
              Dados Históricos
            </h3>

            <div className="space-y-2">
              <Label htmlFor="initial_flights">Voos Iniciais (Histórico)</Label>
              <Input
                id="initial_flights"
                type="number"
                min="0"
                value={formData.initial_flights || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === "" ? 0 : Number(value);
                  setFormData(prev => ({ ...prev, initial_flights: numValue }));
                }}
                placeholder="Ex: 127"
              />
              <p className="text-xs text-muted-foreground">
                Novos voos serão somados a este valor automaticamente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial_minutes">Horas de Voo Iniciais</Label>
              <Input
                id="initial_minutes"
                type="number"
                min="0"
                step="0.1"
                value={formData.initial_minutes ? (formData.initial_minutes / 60).toFixed(1) : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const hoursValue = value === "" ? 0 : Number(value);
                  const minutesValue = Math.round(hoursValue * 60);
                  setFormData(prev => ({ ...prev, initial_minutes: minutesValue }));
                }}
                placeholder="Ex: 200.5 (horas)"
              />
              <p className="text-xs text-muted-foreground">
                Novas horas de voo serão somadas a este valor automaticamente
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Estatísticas de Carreira
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="career_started">Carreira Iniciada</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="career_started"
                    type="date"
                    value={formData.career_started}
                    onChange={(e) => setFormData(prev => ({ ...prev, career_started: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="perfect_flights">Pousos Perfeitos</Label>
                <Input
                  id="perfect_flights"
                  type="number"
                  min="0"
                  value={formData.perfect_flights || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? 0 : Number(value);
                    setFormData(prev => ({ ...prev, perfect_flights: numValue }));
                  }}
                  placeholder="42"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="achievements">Conquistas</Label>
              <div className="flex items-start gap-2">
                <Trophy className="h-4 w-4 text-success mt-3" />
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                  placeholder="Descreva suas principais conquistas e certificações..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Resumo Calculado
            </h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Total de Voos:</span>
                <span className="font-mono">{formData.initial_flights} voos de histórico</span>
              </div>
              <div className="flex justify-between">
                <span>Total de Horas:</span>
                <span className="font-mono">{formData.initial_minutes}h</span>
              </div>
              <div className="flex justify-between">
                <span>CR Atual:</span>
                <span className="font-mono text-accent">{formatCR(dynamicCR)} CR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};