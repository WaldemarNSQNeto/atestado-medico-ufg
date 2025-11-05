import React, { useEffect, useRef } from 'react';
import { RequestDetails } from '../types.ts';

interface AdditionalRequestFormProps {
    index: number;
    data: RequestDetails;
    onChange: (index: number, data: RequestDetails) => void;
    onRemove: (index: number) => void;
    onDuplicate: (details: RequestDetails) => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

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

const AdditionalRequestForm: React.FC<AdditionalRequestFormProps> = ({ index, data, onChange, onRemove, onDuplicate, showToast }) => {
    const resumoClinicoRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        if (resumoClinicoRef.current) {
            resumoClinicoRef.current.style.height = 'auto';
            resumoClinicoRef.current.style.height = `${resumoClinicoRef.current.scrollHeight}px`;
        }
    }, [data.resumoClinico]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        let { name, value } = e.target;

        const limits: { [key: string]: number } = {
            originSector: 41,
            servicoEncaminhado: 37,
            resumoClinico: 517,
        };
    
        if (limits[name] && value.length > limits[name]) {
            value = value.slice(0, limits[name]);
        }

        const updatedValue = (name === 'requestDate') ? formatDate(value) : value;
        onChange(index, { ...data, [name]: updatedValue });
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            showToast('Quebras de linha não são permitidas.', 'error');
        }
    };

    return (
        <div className="p-6 space-y-4 mt-6 border-t-2 border-dashed relative">
            <button
                type="button"
                onClick={() => onRemove(index)}
                title="Remover Interconsulta"
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>

            <div className="flex justify-between items-center border-b border-gray-300 mb-2">
                <h2 className="text-xl font-semibold text-black pb-1">
                    {index + 2}ª Interconsulta - Detalhes
                </h2>
                <button
                    type="button"
                    onClick={() => onDuplicate(data)}
                    className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                    title="Duplicar esta interconsulta"
                >
                    Duplicar?
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <label htmlFor={`originSector${index}`} className="block text-sm font-medium text-gray-700 mb-1">Especialidade de Origem:</label>
                    <input 
                        type="text" 
                        name="originSector" 
                        id={`originSector${index}`}
                        value={data.originSector} 
                        onChange={handleChange} 
                        className="w-full bg-gray-100 border-gray-300 rounded-md p-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={41}
                    />
                    <span className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none">{data.originSector.length} / 41</span>
                </div>
                <div className="relative">
                    <label htmlFor={`servicoEncaminhado${index}`} className="block text-sm font-medium text-gray-700 mb-1">Encaminhamento ao Serviço de:</label>
                    <input 
                        type="text" 
                        name="servicoEncaminhado" 
                        id={`servicoEncaminhado${index}`}
                        value={data.servicoEncaminhado} 
                        onChange={handleChange} 
                        className="w-full bg-gray-100 border-gray-300 rounded-md p-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={37}
                    />
                    <span className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none">{data.servicoEncaminhado.length} / 37</span>
                </div>
            </div>

            <div className="relative">
                <label htmlFor={`resumoClinico${index}`} className="block text-sm font-medium text-gray-700 mb-1">Justificativa:</label>
                <textarea 
                    ref={resumoClinicoRef}
                    name="resumoClinico" 
                    id={`resumoClinico${index}`}
                    value={data.resumoClinico} 
                    onChange={handleChange} 
                    onKeyDown={handleKeyDown}
                    className="w-full bg-gray-100 border-gray-300 rounded-md p-2 pb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden text-justify"
                    rows={6}
                    placeholder="Descreva o quadro clínico, hipóteses diagnósticas e o motivo da interconsulta..."
                    maxLength={517}
                />
                <span className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none">{data.resumoClinico.length} / 517</span>
            </div>
            <div>
                <label htmlFor={`requestDate${index}`} className="block text-sm font-medium text-gray-700 mb-1">Data:</label>
                <input 
                    type="text" 
                    name="requestDate" 
                    id={`requestDate${index}`}
                    value={data.requestDate} 
                    onChange={handleChange} 
                    placeholder="DD/MM/AAAA" 
                    className="w-full bg-gray-100 border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
            </div>
        </div>
    );
};

export default AdditionalRequestForm;