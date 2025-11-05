import React, { useState, useEffect } from 'react';
import { FormData } from './types.ts';
import Form from './components/Form';
import Preview from './components/Preview';
import Toast from './components/Toast';

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


const App: React.FC = () => {
    const getTodayDate = (): string => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    };
    
    const emptyFormData: FormData = {
        patientName: '',
        patientId: '',
        cid: '',
        daysOffNumeric: '',
        startDate: '',
        attestationDate: getTodayDate(),
    };

    const [formData, setFormData] = useState<FormData>(emptyFormData);
    const [generatedText, setGeneratedText] = useState<string>('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; key: number } | null>(null);
    const [isDateInvalid, setIsDateInvalid] = useState<boolean>(false);

    useEffect(() => {
        const patientName = formData.patientName || '_____________________________\u200B____________________\u200B_______';
        const patientId = formData.patientId || '__________________________';
        const cid = formData.cid || '______';
        
        const daysOffNumeric = formData.daysOffNumeric;
        const daysOffPadded = daysOffNumeric && parseInt(daysOffNumeric, 10) > 0 ? String(daysOffNumeric).padStart(2, '0') : '____';
        const daysOffInWords = numberToWordsPt(daysOffNumeric);
        const daysOffInWordsDisplay = daysOffInWords === '...' ? '__________' : daysOffInWords;

        const startDate = formData.startDate || '______________________';
        
        const text = `A pedido do(a) interessado(a) ${patientName}, Carteira de Identidade e/ou CPF nº ${patientId}, e na qualidade de seu médico assistente, atesto, para os devidos fins, que o(a) mesmo(a), por motivos de doença (CID: ${cid}), ficou (ou estará) impossibilitado(a) de exercer suas atividades durante ${daysOffPadded} (${daysOffInWordsDisplay}) dias a partir de ${startDate}.`;
        
        setGeneratedText(text);
    }, [formData]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type, key: Date.now() });
    };

    const handlePrint = (): void => {
        const printContainerEl = document.getElementById('printable-container');
        const printStylesTemplate = document.getElementById('print-styles-template') as HTMLTemplateElement;

        if (!printContainerEl || !printStylesTemplate) {
            console.error('Elemento para impressão ou template de estilos não encontrados.');
            alert('Ocorreu um erro ao tentar preparar a impressão. Por favor, recarregue a página.');
            return;
        }

        const printWindow = window.open('', '_blank', 'height=800,width=1200,menubar=no,toolbar=no,location=no,status=no');

        if (printWindow) {
            printWindow.document.write(`
            <html>
                <head>
                <title>Imprimir Atestado Médico</title>
                <script src="https://cdn.tailwindcss.com"></script>
                ${printStylesTemplate.innerHTML}
                </head>
                <body>
                ${printContainerEl.outerHTML}
                </body>
            </html>
            `);

            printWindow.document.close();
            
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            };
        }
    };

    const handleClearForm = (): void => {
        setFormData(emptyFormData);
        setIsDateInvalid(false);
        showToast('Formulário limpo com sucesso!');
    };
    
    return (
        <div className="text-gray-900 min-h-screen font-sans antialiased flex flex-col">
            {toast && (
                <Toast
                    key={toast.key}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="flex-grow">
                <header>
                    <div className="main-title-container">
                        <img src="/The-Rod-of-Asclepius2-V2.png" alt="Cajado de Asclépio" className="header-icon" />
                        <hr className="header-divider" />            
                        <h1 className="text-3xl font-bold my-2">Gerador de Atestado Médico</h1>
                        <hr className="header-divider" />            
                    </div>
                </header>

                <div id="app-container">
                    <main>
                        <Form 
                            formData={formData} 
                            setFormData={setFormData}
                            generatedText={generatedText}
                            setGeneratedText={setGeneratedText}
                            showToast={showToast}
                            isDateInvalid={isDateInvalid}
                            setIsDateInvalid={setIsDateInvalid}
                        />
                        
                        <div className="p-4 mt-6 border-t border-gray-200 space-y-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePrint}
                                    disabled={isDateInvalid}
                                    title={isDateInvalid ? "A data de início do afastamento é inválida." : "Imprimir Atestado"}
                                    className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Imprimir Atestado
                                </button>
                                <button
                                    onClick={handleClearForm}
                                    title="Limpar Formulário"
                                    aria-label="Limpar Formulário"
                                    className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white font-bold p-3 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <footer className="site-footer">
                <hr className="footer-divider" />
                <p>
                    ⚕️ Asklépios Soluções Médicas ⚕️<br />
                    Startup by Waldemar Neto - Interno Turma LXIX<br />
                    V. Alfa 1.0. (04/11/2025)
                </p>
            </footer>

            {/* Container de pré-visualização para impressão (invisível) */}
            <div style={{ display: 'none' }}>
                <Preview 
                    formData={formData} 
                    generatedText={generatedText}
                />
            </div>
        </div>
    );
};

export default App;
