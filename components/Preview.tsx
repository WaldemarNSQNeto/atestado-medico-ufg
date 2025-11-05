import React from 'react';
import { FormData } from '../types.ts';

interface PreviewProps {
    formData: FormData;
    generatedText: string;
}

// Helper function to convert number to Portuguese words
const numberToWordsPt = (numStr: string): string => {
    if (!numStr) return '...';
    const num = parseInt(numStr, 10);
    if (isNaN(num) || num <= 0) return '...';

    const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const teens = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];

    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
        const ten = Math.floor(num / 10);
        const unit = num % 10;
        return tens[ten] + (unit > 0 ? " e " + units[unit] : "");
    }
    // Fallback for numbers >= 100, which are less common for days off
    return String(num); 
};


const Preview: React.FC<PreviewProps> = ({ formData, generatedText }) => {
    
    const formatDateForPreview = (dateStr: string): { day: string, month: string, year: string } => {
        if (!dateStr || dateStr.length < 10) return { day: '__', month: '______', year: '____' };
        
        const parts = dateStr.split('/');
        if (parts.length !== 3) return { day: '__', month: '______', year: '____' };
        
        const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
        const monthIndex = parseInt(parts[1], 10) - 1;
        
        return {
            day: parts[0],
            month: monthNames[monthIndex] || '______',
            year: parts[2]
        };
    };
    
    const { day, month, year } = formatDateForPreview(formData.attestationDate);

    // Prioriza o texto gerado, mas cria um texto dinâmico como fallback
    // para garantir que a impressão nunca fique vazia e seja consistente.
    const getBodyText = () => {
        if (generatedText) {
            return generatedText;
        }

        const patientName = formData.patientName || '____________________\u200B____________________\u200B_______';
        const patientId = formData.patientId || '__________________________';
        const cid = formData.cid || '______';

        const daysOffNumeric = formData.daysOffNumeric;
        const daysOffPadded = daysOffNumeric && parseInt(daysOffNumeric, 10) > 0 ? String(daysOffNumeric).padStart(2, '0') : '____';
        const daysOffInWords = numberToWordsPt(daysOffNumeric);
        const daysOffInWordsDisplay = daysOffInWords === '...' ? '__________' : daysOffInWords;


        const startDate = formData.startDate || '______________________';
        
        return `A pedido do(a) interessado(a) ${patientName}, Carteira de Identidade e/ou CPF nº ${patientId}, e na qualidade de seu médico assistente, atesto, para os devidos fins, que o(a) mesmo(a), por motivos de doença (CID: ${cid}), ficou (ou estará) impossibilitado(a) de exercer suas atividades durante ${daysOffPadded} (${daysOffInWordsDisplay}) dias a partir de ${startDate}.`;
    };
    
    return (
        <div id="printable-container">
            <div className="printable-page bg-white text-black p-4 mx-auto w-full max-w-[210mm] aspect-[210/297] shadow-2xl">
                <div className="flex flex-col p-6 h-full font-serif text-base">
                    <header className="flex flex-col justify-center items-center pb-4 border-b-2 border-black" style={{ minHeight: '5rem' }}>
                        <div className="h-20 flex justify-center items-center overflow-hidden">
                            <img 
                                src="https://i.imgur.com/LoP97om.png" 
                                alt="Logo Ebserh" 
                                className="h-full"
                            />
                        </div>
                        <p className="text-[10px] text-center mt-2">
                            Rua 235, nº 285, Quadra 68, Lote Área, s/nº, Setor Leste Universitário - Fone: (62) 3269-8200 - Goiânia - GO, 74605-050
                        </p>
                    </header>

                    <h1 className="text-center font-bold text-xl my-8 underline uppercase tracking-widest">
                        Atestado Médico
                    </h1>
                      
                    <section className="flex-grow text-justify leading-loose p-2">
                        <p style={{ textIndent: '3em' }}>{getBodyText()}</p>
                    </section>

                    <footer className="text-sm">
                        <p className="text-right mb-12">Goiânia/GO, {day} de {month} de {year}.</p>
                        
                        <div className="flex flex-col items-center my-8 space-y-1">
                            <div className="w-4/5 border-b border-solid border-black"></div>
                            <p className="text-normal font-bold">Médico/CRM</p>
                        </div>

                        <div className="w-full border-b-2 border-solid border-black my-4"></div>
                        
                        <p className="text-sm text-center italic mt-4">
                            "O presente atestado é fornecido com ciência dos dispositivos legais vigentes (Código Penal, Artigo 302), encontrando-se laudo detalhado sobre o caso à disposição a quem de direito possa interessar."
                        </p>

                        
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Preview;