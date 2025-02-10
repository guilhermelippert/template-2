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
  const [autoSelectedColumns, setAutoSelectedColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  // Carregar mapeamento salvo do localStorage ao montar o componente
  useEffect(() => {
    const savedMapping = localStorage.getItem('columnMapping');
    if (savedMapping) {
      const parsedMapping = JSON.parse(savedMapping);
      setMapping(parsedMapping);
      updateColumnMapping(parsedMapping);
    }
  }, []);

  // Salvar mapeamento no localStorage quando atualizado
  useEffect(() => {
    localStorage.setItem('columnMapping', JSON.stringify(mapping));
  }, [mapping]);

  // Tentar fazer o mapeamento automático quando os dados brutos estiverem disponíveis
  useEffect(() => {
    if (rawData.length > 0) {
      const columns = Object.keys(rawData[0] || {});
      const autoMapping: IColumnMapping = { ...mapping };
      const autoSelected: string[] = [];

      // Mapeamento de possíveis nomes de coluna para campos
      const columnMatches = {
        cpf: ['cpf', 'documento', 'documento_cliente', 'cpf_cliente'],
        purchaseDate: ['data', 'data_compra', 'purchase_date', 'data_pedido'],
        purchaseValue: ['valor', 'value', 'valor_compra', 'purchase_value', 'total'],
      };

      // Verificar cada campo para correspondência automática
      Object.entries(columnMatches).forEach(([field, matches]) => {
        const foundColumn = columns.find(col => 
          matches.includes(col.toLowerCase()) || 
          matches.some(match => col.toLowerCase().includes(match))
        );

        if (foundColumn && !mapping[field as keyof IColumnMapping]) {
          autoMapping[field as keyof IColumnMapping] = foundColumn;
          autoSelected.push(foundColumn);
        }
      });

      if (autoSelected.length > 0) {
        setMapping(autoMapping);
        updateColumnMapping(autoMapping);
        setAutoSelectedColumns(autoSelected);
      }
    }
  }, [rawData]);

  useEffect(() => {
    if (!rawData || rawData.length === 0) return;
    
    const firstRow = rawData[0];
    const columns = Object.keys(firstRow);
    setAvailableColumns(columns);
  }, [rawData]);

  // Atualizar o mapeamento quando uma coluna é selecionada
  const handleColumnSelect = (field: keyof IColumnMapping, column: string) => {
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
            <div className="flex items-center gap-2">
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
              {autoSelectedColumns.includes(mapping.cpf) && (
                <span className="text-sm text-green-600 whitespace-nowrap">
                  ✓ Seleção automática
                </span>
              )}
            </div>
          </div>

          {/* Campo Data da Compra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data da Compra
            </label>
            <div className="flex items-center gap-2">
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
              {autoSelectedColumns.includes(mapping.purchaseDate) && (
                <span className="text-sm text-green-600 whitespace-nowrap">
                  ✓ Seleção automática
                </span>
              )}
            </div>
          </div>

          {/* Campo Valor da Compra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Compra
            </label>
            <div className="flex items-center gap-2">
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
              {autoSelectedColumns.includes(mapping.purchaseValue) && (
                <span className="text-sm text-green-600 whitespace-nowrap">
                  ✓ Seleção automática
                </span>
              )}
            </div>
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