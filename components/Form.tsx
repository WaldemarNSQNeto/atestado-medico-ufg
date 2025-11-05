import React, { useState, useEffect, useRef } from 'react';
import { FormData } from '../types.ts';

interface FormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  generatedText: string;
  setGeneratedText: React.Dispatch<React.SetStateAction<string>>;
  showToast: (message: string, type?: 'success' | 'error') => void;
  isDateInvalid: boolean;
  setIsDateInvalid: React.Dispatch<React.SetStateAction<boolean>>;
}

const Form: React.FC<FormProps> = ({ formData, setFormData, generatedText, setGeneratedText, isDateInvalid, setIsDateInvalid }) => {
  const [cidResults, setCidResults] = useState<{ co_cid: string; no_cid: string }[]>([]);
  const [isCidSearching, setIsCidSearching] = useState(false);
  const [isCidDropdownOpen, setIsCidDropdownOpen] = useState(false);
  const cidSearchRef = useRef<HTMLDivElement>(null);

  const validateDate = (dateStr: string): boolean => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return false;
    }
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  useEffect(() => {
    const isSearchTerm = !/^[A-Z]\d{2}(\.\d{1,2})?$/.test(formData.cid);

    if (formData.cid.length < 3 || !isSearchTerm) {
        setCidResults([]);
        setIsCidDropdownOpen(false);
        return;
    }

    const debounceTimer = setTimeout(async () => {
        setIsCidSearching(true);
        try {
            const response = await fetch(`https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(formData.cid)}`);
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            
            if (data && Array.isArray(data) && data.length > 3 && Array.isArray(data[3])) {
              const formattedResults = data[3].map((item: [string, string]) => ({
                  co_cid: item[0],
                  no_cid: item[1],
              }));
              setCidResults(formattedResults);
              setIsCidDropdownOpen(formattedResults.length > 0);
            } else {
              setCidResults([]);
              setIsCidDropdownOpen(false);
            }
        } catch (error) {
            console.error('Falha ao buscar códigos CID:', error);
            setCidResults([]);
            setIsCidDropdownOpen(false);
        } finally {
            setIsCidSearching(false);
        }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [formData.cid]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (cidSearchRef.current && !cidSearchRef.current.contains(event.target as Node)) {
            setIsCidDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (formData.startDate) {
        const isValid = validateDate(formData.startDate);
        setIsDateInvalid(!isValid);
    } else {
        setIsDateInvalid(false); // Campo vazio não está em estado de erro.
    }
  }, [formData.startDate, setIsDateInvalid]);


  const handleCidSelect = (result: { co_cid: string; no_cid: string }) => {
    setFormData((prev) => ({ ...prev, cid: result.co_cid }));
    setIsCidDropdownOpen(false);
  };
  
  const formatDate = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'attestationDate' || name === 'startDate') {
      const formattedValue = formatDate(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGeneratedTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setGeneratedText(e.target.value.replace(/[\r\n]/g, ' '));
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-black border-b border-gray-300 pb-1 mb-2">Dados para o Atestado</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="patientName" className="block text-base font-medium text-gray-700 mb-1">Nome do paciente:</label>
          <input type="text" name="patientName" id="patientName" value={formData.patientName} onChange={handleChange} className="w-full bg-gray-100 border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="patientId" className="block text-base font-medium text-gray-700 mb-1">Nº Identidade e/ou CPF:</label>
          <input type="text" name="patientId" id="patientId" value={formData.patientId} onChange={handleChange} className="w-full bg-gray-100 border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div ref={cidSearchRef} className="relative">
            <label htmlFor="cid" className="block text-base font-medium text-gray-700 mb-1">
              CID: <span className="font-normal text-xs text-gray-500">(banco de dados em inglês disponível)</span>
            </label>
            <input 
              type="text" 
              name="cid" 
              id="cid" 
              value={formData.cid} 
              onChange={handleChange} 
              placeholder="Pesquisar por código ou nome..."
              autoComplete="off"
              onFocus={() => { if(cidResults.length > 0) setIsCidDropdownOpen(true) }}
              className="w-full bg-gray-100 border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            {isCidSearching && (
                <div className="absolute top-9 right-2 h-4 w-4">
                    <svg className="animate-spin h-full w-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
            {isCidDropdownOpen && cidResults.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                {cidResults.map((result) => (
                  <li
                    key={result.co_cid}
                    onClick={() => handleCidSelect(result)}
                    className="px-4 py-2 hover:bg-indigo-100 cursor-pointer text-sm"
                    role="option"
                    aria-selected="false"
                  >
                    <span className="font-bold">{result.co_cid}</span> - <span className="text-gray-700">{result.no_cid}</span>
                  </li>
                ))}
              </ul>
            )}
        </div>
        <div>
          <label htmlFor="daysOffNumeric" className="block text-base font-medium text-gray-700 mb-1">Dias de Afastamento:</label>
          <input type="number" name="daysOffNumeric" id="daysOffNumeric" value={formData.daysOffNumeric} onChange={handleChange} className="w-full bg-gray-100 border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-base font-medium text-gray-700 mb-1">Início do Afastamento:</label>
          <input 
            type="text" 
            name="startDate" 
            id="startDate" 
            value={formData.startDate} 
            onChange={handleChange} 
            placeholder="DD/MM/AAAA" 
            className={`w-full bg-gray-100 border-gray-300 rounded-md p-2 focus:outline-none ${isDateInvalid ? 'ring-2 ring-red-500 border-red-500' : 'focus:ring-2 focus:ring-blue-500'}`} 
          />
          {isDateInvalid && (
              <p className="text-red-600 text-xs mt-1">Data inválida. Use o formato DD/MM/AAAA.</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="attestationDate" className="block text-base font-medium text-gray-700 mb-1">Data de Emissão do Atestado:</label>
        <input type="text" name="attestationDate" id="attestationDate" value={formData.attestationDate} onChange={handleChange} placeholder="DD/MM/AAAA" className="w-full bg-gray-100 border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="relative pt-4">
        <label htmlFor="generatedText" className="block text-base font-medium text-gray-700 mb-1">Texto do Atestado (editável):</label>
        <textarea 
            name="generatedText" 
            id="generatedText" 
            value={generatedText} 
            onChange={handleGeneratedTextChange}
            className="w-full bg-gray-50 border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y text-justify"
            rows={5}
            placeholder="O texto do atestado aparecerá aqui..."
        />
      </div>
    </div>
  );
};

export default Form;