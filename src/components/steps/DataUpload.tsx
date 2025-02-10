"use client";

import { useState } from "react";
import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import { RawUploadData } from "@/lib/types/cohort";
import * as XLSX from 'xlsx';
import { AnalyticsService } from '@/lib/services/analyticsService';
import MetricsSummary from '../analytics/MetricsSummary';

export default function DataUpload() {
  const { uploadData, canProceedToNext, setCurrentStep } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    setLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const data = await readExcelFile(file);
      await AnalyticsService.processAndStore(data);
      uploadData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar arquivo");
      setFileName(null);
    } finally {
      setLoading(false);
    }
  };

  const readExcelFile = (file: File): Promise<RawUploadData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          resolve(jsonData as RawUploadData[]);
        } catch (err) {
          reject(new Error("Erro ao ler arquivo Excel"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Erro ao ler arquivo"));
      };

      reader.readAsBinaryString(file);
    });
  };

  const downloadExampleFile = () => {
    // Dados de exemplo
    const exampleData = [
      {
        cpf: '123.456.789-00',
        data_compra: '2024-01-15',
        valor_compra: 150.00,
        canal: 'facebook',
        categoria: 'roupas',
        cidade: 'São Paulo',
        estado: 'SP',
        metodo_pagamento: 'cartao_credito'
      },
      {
        cpf: '987.654.321-00',
        data_compra: '2024-01-16',
        valor_compra: 299.90,
        canal: 'google',
        categoria: 'eletronicos',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        metodo_pagamento: 'pix'
      },
      {
        cpf: '456.789.123-00',
        data_compra: '2024-01-16',
        valor_compra: 89.90,
        canal: 'instagram',
        categoria: 'acessorios',
        cidade: 'Curitiba',
        estado: 'PR',
        metodo_pagamento: 'boleto'
      }
    ];

    // Criar uma nova planilha
    const ws = XLSX.utils.json_to_sheet(exampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");

    // Configurar larguras das colunas
    const colWidths = [
      { wch: 15 }, // cpf
      { wch: 12 }, // data_compra
      { wch: 12 }, // valor_compra
      { wch: 10 }, // canal
      { wch: 12 }, // categoria
      { wch: 15 }, // cidade
      { wch: 5 },  // estado
      { wch: 15 }  // metodo_pagamento
    ];
    ws['!cols'] = colWidths;

    // Baixar o arquivo
    XLSX.writeFile(wb, "exemplo_dados_cohort.xlsx");
  };

  // Função para ir para próxima etapa
  const handleNext = () => {
    if (canProceedToNext) {
      setCurrentStep('mapping');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload de Dados</h2>
          <button
            onClick={downloadExampleFile}
            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Baixar Planilha de Exemplo
          </button>
        </div>
        
        {/* Instruções e Exemplo */}
        <div className="mb-8 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-medium text-gray-700">
              Dados Necessários para Análise
            </h3>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showInstructions ? 'Ocultar' : 'Mostrar'} Instruções
            </button>
          </div>

          {showInstructions && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Seu arquivo deve conter os seguintes dados de compras dos últimos meses:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Dados Obrigatórios:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>CPF do cliente (ou identificador único)</li>
                    <li>Data da compra</li>
                    <li>Valor da compra</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Dados Opcionais:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Canal de aquisição</li>
                    <li>Categoria do produto</li>
                    <li>Cidade/Estado do cliente</li>
                    <li>Método de pagamento</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Exemplo de Formato:</h4>
                <div className="bg-white p-3 rounded border text-sm overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left">cpf</th>
                        <th className="px-3 py-2 text-left">data_compra</th>
                        <th className="px-3 py-2 text-left">valor_compra</th>
                        <th className="px-3 py-2 text-left">canal</th>
                        <th className="px-3 py-2 text-left">categoria</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-3 py-2">123.456.789-00</td>
                        <td className="px-3 py-2">2024-01-15</td>
                        <td className="px-3 py-2">150.00</td>
                        <td className="px-3 py-2">facebook</td>
                        <td className="px-3 py-2">roupas</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Observações Importantes:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>O arquivo deve estar no formato .xlsx ou .csv</li>
                  <li>CPFs devem estar em formato texto para preservar os zeros à esquerda</li>
                  <li>Datas devem estar em formato YYYY-MM-DD</li>
                  <li>Valores devem usar ponto como separador decimal</li>
                  <li>Recomendamos dados dos últimos 12-24 meses para melhor análise</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Área de Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="fileUpload"
            disabled={loading}
          />
          <label
            htmlFor="fileUpload"
            className={`cursor-pointer inline-flex flex-col items-center 
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'}`}
          >
            <svg
              className="w-12 h-12 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-base">
              {fileName ? fileName : "Clique para fazer upload"}
            </span>
            <span className="text-sm text-gray-500 mt-1">
              Formatos aceitos: .xlsx, .csv
            </span>
          </label>
        </div>

        {/* Mensagens de Status */}
        {loading && (
          <div className="text-center text-gray-600 animate-pulse mt-4">
            Processando arquivo...
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 bg-red-50 p-3 rounded-md mt-4">
            {error}
          </div>
        )}

        {/* Área de Integração (Em breve) */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Integração com E-commerce
          </h3>
          <p className="text-sm text-gray-500">
            Em breve: conecte diretamente com sua plataforma de e-commerce
          </p>
        </div>

        {/* Botão de Próximo */}
        {canProceedToNext && (
          <button
            onClick={handleNext}
            className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
          >
            Próximo Passo
          </button>
        )}

        {/* Adicionar indicador de dados carregados */}
        {canProceedToNext && (
          <div className="mt-2 text-sm text-green-600 text-center">
            ✓ Dados carregados com sucesso! Clique em "Próximo Passo" para continuar.
          </div>
        )}
      </div>

      {/* Adicionar o componente de métricas após o upload bem-sucedido */}
      {canProceedToNext && (
        <MetricsSummary />
      )}
    </div>
  );
} 