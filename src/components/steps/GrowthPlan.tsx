"use client";

import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import { useState } from "react";

export default function GrowthPlan() {
  const { updateFinancialMetrics, setCurrentStep, financialMetrics } = useAnalytics();

  const [formData, setFormData] = useState({
    cac: financialMetrics.cac || "",
    cpv: financialMetrics.cpv || "",
    margin: financialMetrics.margin || "",
    monthlyInvestment: financialMetrics.monthlyInvestment || "",
    monetizationInvestment: financialMetrics.monetizationInvestment || "",
  });

  const handleInputChange = (field: string, value: string) => {
    const numValue = value === "" ? "" : Number(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSubmit = () => {
    // Converter valores para números e calcular percentuais
    const metrics = {
      cac: Number(formData.cac),
      cpv: Number(formData.cpv),
      margin: Number(formData.margin) / 100, // Converter percentual para decimal
      monthlyInvestment: Number(formData.monthlyInvestment),
      monetizationInvestment: Number(formData.monetizationInvestment),
    };

    updateFinancialMetrics(metrics);
    setCurrentStep('visualization');
  };

  const canProceedToNext = 
    formData.cac !== "" && 
    formData.cpv !== "" && 
    formData.margin !== "" && 
    formData.monthlyInvestment !== "" &&
    formData.monetizationInvestment !== "";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Plano de Growth</h2>
        
        <div className="space-y-6">
          {/* CAC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CAC (Custo de Aquisição de Cliente)
              <span className="text-xs text-gray-500 ml-2">
                Quanto você gasta em média para adquirir um novo cliente?
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2">R$</span>
              <input
                type="number"
                value={formData.cac}
                onChange={(e) => handleInputChange('cac', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-md"
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* CPV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPV (Custo por Venda)
              <span className="text-xs text-gray-500 ml-2">
                Custo total de marketing do mês dividido pelo número de vendas
              </span>
            </label>
            <div className="space-y-2">
              <div className="text-xs text-gray-500">
                Por exemplo: Se você investiu R$ 10.000 em marketing e teve 100 vendas,
                seu CPV é R$ 100 por venda.
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2">R$</span>
                <input
                  type="number"
                  value={formData.cpv}
                  onChange={(e) => handleInputChange('cpv', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border rounded-md"
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Margem de Contribuição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Margem de Contribuição
              <span className="text-xs text-gray-500 ml-2">
                Percentual da receita que sobra para cobrir custos fixos após descontar custos variáveis
              </span>
            </label>
            <div className="space-y-2">
              <div className="text-xs text-gray-500">
                Fórmula: (Receita - Custos Variáveis) / Receita * 100
                <br />
                Custos Variáveis incluem: custo do produto, frete, embalagem, comissões, taxas de pagamento
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={formData.margin}
                  onChange={(e) => handleInputChange('margin', e.target.value)}
                  className="w-full pr-8 pl-3 py-2 border rounded-md"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="absolute right-3 top-2">%</span>
              </div>
            </div>
          </div>

          {/* Investimento Mensal em Mídia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investimento Mensal em Mídia de Aquisição
              <span className="text-xs text-gray-500 ml-2">
                Quanto você planeja investir mensalmente em mídia para aquisição?
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2">R$</span>
              <input
                type="number"
                value={formData.monthlyInvestment}
                onChange={(e) => handleInputChange('monthlyInvestment', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-md"
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Investimento em Retenção */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investimento Mensal em Retenção
              <span className="text-xs text-gray-500 ml-2">
                Quanto você planeja investir mensalmente em estratégias de retenção?
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2">R$</span>
              <input
                type="number"
                value={formData.monetizationInvestment}
                onChange={(e) => handleInputChange('monetizationInvestment', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-md"
                placeholder="0,00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Dicas e Explicações */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Dicas para um Plano de Growth Efetivo:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• O CAC deve ser menor que o LTV (Valor do Tempo de Vida do Cliente)</li>
              <li>• Uma margem de contribuição saudável é essencial para cobrir custos fixos e gerar lucro</li>
              <li>• Balance o investimento entre aquisição e retenção (geralmente 70/30)</li>
              <li>• O CPV ajuda a entender o custo real de marketing por venda realizada</li>
              <li>• Monitore a relação entre CAC e CPV para otimizar suas campanhas</li>
            </ul>
          </div>

          {/* Botões de Navegação */}
          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep('mapping')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Voltar
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!canProceedToNext}
              className={`px-4 py-2 rounded-md text-white
                ${canProceedToNext
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 cursor-not-allowed'
                }`}
            >
              Visualizar Projeções
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 