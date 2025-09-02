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
    total_flights: number;
    total_hours: number;
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

  const [formData, setFormData] = useState({
    display_name: profileData?.display_name || "Cmdte. Rodrigo",
    avatar_url: profileData?.avatar_url || "",
    initial_flights: profileData?.total_flights || 0,
    initial_hours: profileData?.total_hours || 0,
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

  // Atualizar formData quando profileData mudar
  useEffect(() => {
    if (profileData && isOpen) {
      setFormData({
        display_name: profileData.display_name || "Cmdte. Rodrigo",
        avatar_url: profileData.avatar_url || "",
        initial_flights: profileData.total_flights || 0,
        initial_hours: profileData.total_hours || 0,
        career_started: profileData.career_started || new Date().toISOString().split('T')[0],
        achievements: profileData.achievements || "",
        perfect_flights: profileData.perfect_flights || 0,
        description: profileData.description || ""
      });
    }
  }, [profileData, isOpen]); // Adicionar isOpen como dependência

  // Carregar estatísticas financeiras apenas quando o modal abrir
  useEffect(() => {
    if (isOpen && user?.id) {
      try {
        const stats = getFinancialStats(); // getFinancialStats não aceita parâmetros
        setFinancialStats(stats);
      } catch (error) {
        console.error('Erro ao carregar estatísticas financeiras:', error);
      }
    }
  }, [isOpen, user?.id, getFinancialStats]); // Manter getFinancialStats nas dependências

  // Calcular CR dinâmico baseado no lucro líquido
  const dynamicCR = Math.max(0, Math.floor(currentNetProfit / 1000));

  // Função para formatar CR
  const formatCR = (cr: number) => {
    return cr.toLocaleString('pt-BR');
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
      console.error('Erro ao fazer upload do avatar:', error);
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
        total_flights: formData.initial_flights,
        total_hours: formData.initial_hours,
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
      console.error('Erro ao atualizar perfil:', error);
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
                value={formData.initial_flights}
                onChange={(e) => setFormData(prev => ({ ...prev, initial_flights: parseInt(e.target.value) || 0 }))}
                placeholder="127"
              />
              <p className="text-xs text-muted-foreground">
                Novos voos serão somados a este valor automaticamente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial_hours">Horas Iniciais (Histórico)</Label>
              <Input
                id="initial_hours"
                type="number"
                min="0"
                value={formData.initial_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, initial_hours: parseInt(e.target.value) || 0 }))}
                placeholder="348"
              />
              <p className="text-xs text-muted-foreground">
                Novas horas serão somadas a este valor automaticamente
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
                  value={formData.perfect_flights}
                  onChange={(e) => setFormData(prev => ({ ...prev, perfect_flights: parseInt(e.target.value) || 0 }))}
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
                <span className="font-mono">{formData.initial_flights + financialStats.flightStats.totalFlights}</span>
              </div>
              <div className="flex justify-between">
                <span>Total de Horas:</span>
                <span className="font-mono">{formData.initial_hours + (financialStats.flightStats.totalFlightTime || 0)}h</span>
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