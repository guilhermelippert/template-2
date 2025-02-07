"use client";

import { useState } from "react";
import { useAnalytics } from "@/lib/contexts/AnalyticsContext";
import { RawUploadData } from "@/lib/types/cohort";
import * as XLSX from 'xlsx';

export default function DataUpload() {
  const { uploadData } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await readExcelFile(file);
      uploadData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar arquivo");
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload de Dados</h2>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="fileUpload"
          />
          <label
            htmlFor="fileUpload"
            className="cursor-pointer text-blue-600 hover:text-blue-800"
          >
            Clique para fazer upload
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Formatos aceitos: .xlsx, .csv
          </p>
        </div>

        {loading && (
          <div className="text-center text-gray-600">
            Processando arquivo...
          </div>
        )}

        {error && (
          <div className="text-center text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 