// Vercel Serverless Function: /api/metrics

const METRICS = [
  { id: 'medical_necessity', name: 'Medical Necessity Argumentation', weight: 10, description: 'Strength of clinical justification for the requested treatment/service' },
  { id: 'clinical_evidence', name: 'Clinical Evidence & Guideline Citation', weight: 9, description: 'References to peer-reviewed literature, NCCN, UpToDate, clinical guidelines' },
  { id: 'plan_language', name: 'Plan Language Reference', weight: 8, description: "Cites the insurer's own coverage criteria, plan documents, or formulary language" },
  { id: 'legal_regulatory', name: 'Legal/Regulatory Compliance', weight: 8, description: 'ERISA, ACA, state mandate references, regulatory framework accuracy' },
  { id: 'denial_rebuttal', name: 'Denial Reason Rebuttal', weight: 10, description: 'Directly and specifically addresses the stated denial rationale point by point' },
  { id: 'patient_specific', name: 'Patient-Specific Clinical Detail', weight: 7, description: 'Incorporates individual medical history, comorbidities, prior treatments' },
  { id: 'structural_completeness', name: 'Structural Completeness', weight: 6, description: 'Proper format: header, timeline, narrative, request, escalation path' },
  { id: 'persuasive_tone', name: 'Persuasive Tone Calibration', weight: 7, description: 'Assertive but professional tone; not adversarial or obsequious' },
  { id: 'actionable_request', name: 'Actionable Request Clarity', weight: 7, description: 'Unambiguous ask: overturn, peer-to-peer review, external review, expedited review' },
  { id: 'supporting_docs', name: 'Supporting Documentation References', weight: 6, description: 'Calls out attached records, letters of medical necessity, chart notes' },
  { id: 'urgency_timeline', name: 'Urgency & Timeline Communication', weight: 8, description: 'Deadlines, clinical consequences of delay, time-sensitive treatment needs' },
  { id: 'precedent_history', name: 'Precedent & Prior Auth History', weight: 6, description: 'Cites relevant prior authorizations, comparable approvals, or case law' },
  { id: 'readability', name: 'Readability & Clarity', weight: 5, description: 'Accessible to non-clinical reviewers while maintaining medical accuracy' },
  { id: 'required_elements', name: 'Completeness of Required Elements', weight: 7, description: 'All regulatory appeal requirements met (member ID, dates, provider info, etc.)' },
  { id: 'overall_effectiveness', name: 'Overall Predicted Effectiveness', weight: 10, description: 'Composite likelihood of appeal overturn based on all factors' },
];

export default function handler(req, res) {
  res.json({ metrics: METRICS });
}
