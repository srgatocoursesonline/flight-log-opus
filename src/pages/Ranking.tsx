import { Trophy, TrendingUp, Award, DollarSign, AlertCircle, Plane, Medal, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRankingStats } from "@/hooks/supabase/useRankingStats";
import { RankingCard } from "@/components/ranking/RankingCard";
import { RankingSection } from "@/components/ranking/RankingSection";
import { FlightDetailModal } from "@/components/flights/FlightDetailModal";
import { TransactionDetailModal } from "@/components/ranking/TransactionDetailModal";
import { useState } from "react";

const Ranking = () => {
  const { t } = useTranslation();
  const { rankingStats, isLoading } = useRankingStats();
  
  // Estados para controlar modais
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  
  // Funções para abrir modais
  const handleFlightClick = (flightData: any) => {
    setSelectedFlight(flightData);
    setIsFlightModalOpen(true);
  };
  
  const handleTransactionClick = (transactionData: any) => {
    setSelectedTransaction(transactionData);
    setIsTransactionModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="mobile-container mobile-bottom-nav-padding">
        <div className="mobile-section mobile-fade-in">
          <h1 className="mobile-title gradient-title">
            {t('ranking.title')}
          </h1>
          <p className="mobile-subtitle">
            {t('ranking.subtitle')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const hasData = rankingStats.bestLanding ||
                 rankingStats.longestFlight ||
                 rankingStats.highestCR ||
                 rankingStats.highestXP ||
                 rankingStats.highestPassiveIncome ||
                 rankingStats.highestExpense;

  return (
    <div className="mobile-container mobile-bottom-nav-padding">
      <div className="mobile-section mobile-fade-in">
        <h1 className="mobile-title gradient-title">
          {t('ranking.title')}
        </h1>
        <p className="mobile-subtitle">
          {t('ranking.subtitle')}
        </p>
      </div>

      {!hasData ? (
        <div className="mobile-section">
          <div className="hud-display stats-card p-6 text-center">
            <Trophy className="h-12 w-12 text-readable-muted mx-auto mb-4 icon-hover" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Sem dados disponíveis</h3>
            <p className="text-readable-muted">
              Adicione voos e transações financeiras para ver suas estatísticas de ranking.
            </p>
          </div>
        </div>
      ) : (
        <div className="mobile-section">
          <div className="mobile-grid-2">
            {/* Performance de Voo */}
            {(rankingStats.bestLanding || rankingStats.longestFlight || rankingStats.flightsWithoutPenalties) && (
              <RankingSection
                title="Performance de Voo"
                icon={<Trophy className="h-6 w-6 text-accent" />}
                animationDelay="0.1s"
              >
                {rankingStats.bestLanding && (
                  <RankingCard
                    {...rankingStats.bestLanding}
                    icon={<Plane className="h-5 w-5 text-success" />}
                    animationDelay="0.1s"
                    onClick={() => rankingStats.bestLanding?.flightData && handleFlightClick(rankingStats.bestLanding.flightData)}
                  />
                )}
                {rankingStats.longestFlight && (
                  <RankingCard
                    {...rankingStats.longestFlight}
                    icon={<TrendingUp className="h-5 w-5 text-primary" />}
                    animationDelay="0.2s"
                    onClick={() => rankingStats.longestFlight?.flightData && handleFlightClick(rankingStats.longestFlight.flightData)}
                  />
                )}
                {rankingStats.flightsWithoutPenalties && (
                  <RankingCard
                    {...rankingStats.flightsWithoutPenalties}
                    icon={<Award className="h-5 w-5 text-accent" />}
                    animationDelay="0.3s"
                  />
                )}
              </RankingSection>
            )}

            {/* Progresso e Conquistas */}
            {(rankingStats.highestCR || rankingStats.highestXP) && (
              <RankingSection
                title="Progresso e Conquistas"
                icon={<Award className="h-6 w-6 text-accent" />}
                animationDelay="0.2s"
              >
                {rankingStats.highestCR && (
                  <RankingCard
                    {...rankingStats.highestCR}
                    icon={<Award className="h-5 w-5 text-accent" />}
                    animationDelay="0.1s"
                    onClick={() => rankingStats.highestCR?.flightData && handleFlightClick(rankingStats.highestCR.flightData)}
                  />
                )}
                {rankingStats.highestXP && (
                  <RankingCard
                    {...rankingStats.highestXP}
                    icon={<TrendingUp className="h-5 w-5 text-primary" />}
                    animationDelay="0.2s"
                    onClick={() => rankingStats.highestXP?.flightData && handleFlightClick(rankingStats.highestXP.flightData)}
                  />
                )}
              </RankingSection>
            )}

            {/* Financeiro */}
            {(rankingStats.highestPassiveIncome || rankingStats.highestExpense) && (
              <RankingSection
                title="Financeiro"
                icon={<DollarSign className="h-6 w-6 text-success" />}
                animationDelay="0.3s"
              >
                {rankingStats.highestPassiveIncome && (
                  <RankingCard
                    {...rankingStats.highestPassiveIncome}
                    icon={<DollarSign className="h-5 w-5 text-success" />}
                    animationDelay="0.1s"
                    onClick={() => rankingStats.highestPassiveIncome?.transactionData && handleTransactionClick(rankingStats.highestPassiveIncome.transactionData)}
                  />
                )}
                {rankingStats.highestExpense && (
                  <RankingCard
                    {...rankingStats.highestExpense}
                    icon={<AlertCircle className="h-5 w-5 text-destructive" />}
                    animationDelay="0.2s"
                    onClick={() => rankingStats.highestExpense?.transactionData && handleTransactionClick(rankingStats.highestExpense.transactionData)}
                  />
                )}
              </RankingSection>
            )}

            {/* Global Leaderboard (Placeholder) */}
            <div className="hud-display chart-container mobile-slide-up p-3 lg:p-4" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3 mb-4">
                <Medal className="h-6 w-6 text-primary icon-hover" />
                <h3 className="text-lg font-semibold text-foreground">Global Leaderboard</h3>
              </div>
              
              <div className="text-center py-8">
                <Medal className="h-12 w-12 text-readable-muted mx-auto mb-4 icon-hover pulse-glow" />
                <h4 className="text-lg font-semibold text-foreground mb-2">Leaderboard em Breve</h4>
                <p className="text-readable-muted">
                  Conecte-se com outros pilotos e compare suas conquistas no leaderboard global.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modais */}
      <FlightDetailModal
        flight={selectedFlight}
        open={isFlightModalOpen}
        onOpenChange={setIsFlightModalOpen}
      />
      
      <TransactionDetailModal
        transaction={selectedTransaction}
        open={isTransactionModalOpen}
        onOpenChange={setIsTransactionModalOpen}
      />
    </div>
  );
};

export default Ranking;