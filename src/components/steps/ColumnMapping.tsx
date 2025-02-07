"use client";

import { useState, useEffect } from "react";
import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import { ColumnMapping as IColumnMapping } from "@/lib/types/cohort";

export default function ColumnMapping() {
  const { rawData, updateColumnMapping, setCurrentStep, canProceedToNext } = useAnalytics();
  const [mapping, setMapping] = useState<IColumnMapping>({
    cpf: '',
    purchaseDate: '',
    purchaseValue: '',
  });

  // Log inicial dos dados disponíveis
  useEffect(() => {
    console.log("ColumnMapping - Dados brutos disponíveis:", rawData.length);
    console.log("ColumnMapping - Primeira linha:", rawData[0]);
  }, [rawData]);

  // Obter todas as colunas disponíveis do arquivo
  const availableColumns = Object.keys(rawData[0] || {});
  console.log("ColumnMapping - Colunas disponíveis:", availableColumns);

  // Atualizar o mapeamento quando uma coluna é selecionada
  const handleColumnSelect = (field: keyof IColumnMapping, column: string) => {
    console.log(`ColumnMapping - Mapeando ${field} para coluna ${column}`);
    const newMapping = { ...mapping, [field]: column };
    setMapping(newMapping);
    updateColumnMapping(newMapping);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Mapeamento de Colunas</h2>
        
        <div className="space-y-6">
          {/* Campo CPF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPF do Cliente
            </label>
            <select
              value={mapping.cpf}
              onChange={(e) => handleColumnSelect('cpf', e.target.value)}
              className="w-full border rounded-md py-2 px-3"
            >
              <option value="">Selecione a coluna</option>
              {availableColumns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Data da Compra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data da Compra
            </label>
            <select
              value={mapping.purchaseDate}
              onChange={(e) => handleColumnSelect('purchaseDate', e.target.value)}
              className="w-full border rounded-md py-2 px-3"
            >
              <option value="">Selecione a coluna</option>
              {availableColumns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Valor da Compra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Compra
            </label>
            <select
              value={mapping.purchaseValue}
              onChange={(e) => handleColumnSelect('purchaseValue', e.target.value)}
              className="w-full border rounded-md py-2 px-3"
            >
              <option value="">Selecione a coluna</option>
              {availableColumns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          {/* Botões de Navegação */}
          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep('upload')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Voltar
            </button>
            
            <button
              onClick={() => setCurrentStep('additional')}
              disabled={!canProceedToNext}
              className={`px-4 py-2 rounded-md text-white
                ${canProceedToNext
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 cursor-not-allowed'
                }`}
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 