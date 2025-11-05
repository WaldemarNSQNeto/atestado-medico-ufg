export interface FormData {
  patientName: string;
  patientId: string; // For RG/CPF
  cid: string;
  daysOffNumeric: string;
  startDate: string; // Start date of leave
  attestationDate: string; // Date of certificate issuance
}

// Fix: Add and export the missing 'RequestDetails' interface.
export interface RequestDetails {
  originSector: string;
  servicoEncaminhado: string;
  resumoClinico: string;
  requestDate: string;
}
