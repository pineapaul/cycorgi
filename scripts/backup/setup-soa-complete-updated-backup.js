
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

/**
 * Complete SOA Setup Script (Updated)
 * 
 * What this does:
 * 1) Migrates existing documents to the current schema:
 *    - Renames 'status' -> 'controlStatus' (if present)
 *    - Ensures 'controlApplicability' (defaults to 'Applicable')
 *    - Ensures 'relatedRisks' array
 *    - Ensures 'justification' is an array of CONTROL_JUSTIFICATION values
 *    - Normalises controlStatus 'Planned' -> 'Planning Implementation'
 * 2) Seeds ALL 93 ISO/IEC 27001:2022 Annex A controls
 * 3) Rebuilds indexes, dropping/recreating the unique {id:1} index as 'id_unique'
 * 
 * Fields (no additions): 
 * id, title, description, controlStatus, controlApplicability, relatedRisks, justification, implementationNotes,
 * controlSetId, controlSetTitle, controlSetDescription, createdAt, updatedAt
 */

// CONTROL_JUSTIFICATION constants
const CONTROL_JUSTIFICATION = {
  BEST_PRACTICE: 'Best Practice',
  LEGAL_REQUIREMENT: 'Legal Requirement',
  REGULATORY_REQUIREMENT: 'Regulatory Requirement',
  BUSINESS_REQUIREMENT: 'Business Requirement',
  RISK_MANAGEMENT_REQUIREMENT: 'Risk Management Requirement'
};

// Helpers
function normalisePlanned(status) {
  return status === 'Planned' ? 'Planning Implementation' : status;
}

// Accurate ISO/IEC 27001:2022 control catalogue (93 controls)
function pickStatus(id) {
  // Keep most controls Implemented; some Partially Implemented or Planning Implementation
  const planned = new Set(['A.5.23','A.5.30','A.8.11','A.8.12','A.8.23']);
  const partial = new Set(['A.5.7','A.5.29','A.7.4','A.8.9','A.8.10','A.8.16','A.8.26','A.8.27','A.8.29']);
  if (planned.has(id)) return 'Planning Implementation';
  if (partial.has(id)) return 'Partially Implemented';
  return 'Implemented';
}

function note(id) {
  const n = {
    'A.5.7': 'CTI feeds integrated; SOC use cases tuned.',
    'A.5.23': 'Cloud security baseline defined; rollout via onboarding checklist.',
    'A.5.29': 'Continuity playbooks drafted; quarterly tabletop exercises.',
    'A.5.30': 'Impact mapping in progress; remote access contingencies drafted.',
    'A.6.7': 'MDM, MFA and full‑disk encryption enforced for remote endpoints.',
    'A.7.4': 'CCTV analytics enabled; addressing remaining blind spots.',
    'A.8.1': 'EDR and MDM inventories reconciled with CMDB.',
    'A.8.8': 'Monthly scans; remediation SLAs tracked in backlog.',
    'A.8.9': 'Baseline configs as code; weekly drift review.',
    'A.8.10': 'Secure deletion embedded in deprovisioning runbooks.',
    'A.8.11': 'Data masking policy approved; legacy systems pending rollout.',
    'A.8.12': 'DLP tuning cycle established to reduce false positives.',
    'A.8.13': 'Restore tests performed quarterly; RPO/RTO reviewed.',
    'A.8.15': 'Central logging; retention aligned to statutory requirements.',
    'A.8.16': 'UEBA signals monitored; tuning backlog scheduled.',
    'A.8.23': 'Secure DNS and web filtering staged by business unit.',
    'A.8.26': 'AppSec requirements template in SDLC gates.',
    'A.8.27': 'Architecture review checklist aligned to zero‑trust principles.',
    'A.8.29': 'SAST/DAST integrated in CI/CD; coverage expanding.'
  };
  return n[id] || '';
}

const controlSets = [
  {
    id: 'A.5',
    title: 'Organisational Controls',
    description: 'Policies, governance, supplier and incident management, and continuity.',
    controls: [
      { id: 'A.5.1',  title: 'Policies for information security', description: 'Management direction for information security.', controlStatus: pickStatus('A.5.1'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT], implementationNotes: 'Policy framework approved and reviewed annually.' },
      { id: 'A.5.2',  title: 'Information security roles and responsibilities', description: 'Responsibilities are defined and communicated.', controlStatus: pickStatus('A.5.2'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'RACI maintained in the ISMS.' },
      { id: 'A.5.3',  title: 'Segregation of duties', description: 'Reduce risk of negligent or deliberate misuse.', controlStatus: pickStatus('A.5.3'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: 'SoD enforced through periodic IAM reviews.' },
      { id: 'A.5.4',  title: 'Management responsibilities', description: 'Management ensures security responsibilities are fulfilled.', controlStatus: pickStatus('A.5.4'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'Leadership receives monthly ISMS metrics.' },
      { id: 'A.5.5',  title: 'Contact with authorities', description: 'Maintain relevant authority contacts.', controlStatus: pickStatus('A.5.5'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT], implementationNotes: 'Contact list reviewed annually.' },
      { id: 'A.5.6',  title: 'Contact with special interest groups', description: 'Maintain contacts with special interest groups.', controlStatus: pickStatus('A.5.6'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: 'Memberships in relevant industry groups.' },
      { id: 'A.5.7',  title: 'Threat intelligence', description: 'Gather and analyse threat intelligence.', controlStatus: pickStatus('A.5.7'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: note('A.5.7') },
      { id: 'A.5.8',  title: 'Information security in project management', description: 'Integrate security into project management.', controlStatus: pickStatus('A.5.8'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'Security gates embedded in project lifecycle.' },
      { id: 'A.5.9',  title: 'Inventory of information and other associated assets', description: 'Identify and manage information assets and owners.', controlStatus: pickStatus('A.5.9'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Asset registers reconciled with discovery tools.' },
      { id: 'A.5.10', title: 'Acceptable use of information and other associated assets', description: 'Define acceptable use and responsibilities.', controlStatus: pickStatus('A.5.10'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'AUP acknowledged via HR system.' },
      { id: 'A.5.11', title: 'Return of assets', description: 'Assets returned on termination or role change.', controlStatus: pickStatus('A.5.11'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'Leaver checklist integrated with IT offboarding.' },
      { id: 'A.5.12', title: 'Classification of information', description: 'Classify information by value, sensitivity and criticality.', controlStatus: pickStatus('A.5.12'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Four‑tier scheme with handling rules.' },
      { id: 'A.5.13', title: 'Labelling of information', description: 'Label information appropriately.', controlStatus: pickStatus('A.5.13'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: 'Auto‑labelling enabled where feasible.' },
      { id: 'A.5.14', title: 'Information transfer', description: 'Secure internal and external information transfer.', controlStatus: pickStatus('A.5.14'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Encrypted channels; DSAs for external sharing.' },
      { id: 'A.5.15', title: 'Access control', description: 'Rules for access to information and systems.', controlStatus: pickStatus('A.5.15'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Least privilege enforced.' },
      { id: 'A.5.16', title: 'Identity management', description: 'Identity and credential lifecycle.', controlStatus: pickStatus('A.5.16'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Joiner/mover/leaver automation.' },
      { id: 'A.5.17', title: 'Authentication information', description: 'Credential management and protection.', controlStatus: pickStatus('A.5.17'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'MFA enforced; secrets vaulted.' },
      { id: 'A.5.18', title: 'Access rights', description: 'Provisioning, review and removal of access rights.', controlStatus: pickStatus('A.5.18'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Quarterly recertification for high‑risk apps.' },
      { id: 'A.5.19', title: 'Information security in supplier relationships', description: 'Define and manage supplier security requirements.', controlStatus: pickStatus('A.5.19'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT], implementationNotes: 'TPRM with risk‑tiered due diligence.' },
      { id: 'A.5.20', title: 'Addressing information security within supplier agreements', description: 'Include security requirements in contracts.', controlStatus: pickStatus('A.5.20'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT], implementationNotes: 'Standard contractual clauses maintained.' },
      { id: 'A.5.21', title: 'Managing information security in the ICT supply chain', description: 'Manage ICT supply chain risks.', controlStatus: pickStatus('A.5.21'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Critical dependencies tracked with SLAs.' },
      { id: 'A.5.22', title: 'Monitoring, review and change management of supplier services', description: 'Monitor supplier performance and changes.', controlStatus: pickStatus('A.5.22'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'Periodic reviews and exit plans.' },
      { id: 'A.5.23', title: 'Information security for use of cloud services', description: 'Plan, implement and manage cloud security.', controlStatus: pickStatus('A.5.23'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.5.23') },
      { id: 'A.5.24', title: 'Information security incident management planning and preparation', description: 'Establish and maintain incident management capabilities.', controlStatus: pickStatus('A.5.24'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'IR plan, roles and runbooks approved.' },
      { id: 'A.5.25', title: 'Assessment and decision on information security events', description: 'Triage and decision‑making for events.', controlStatus: pickStatus('A.5.25'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Event severity and playbooks defined.' },
      { id: 'A.5.26', title: 'Response to information security incidents', description: 'Respond and communicate effectively.', controlStatus: pickStatus('A.5.26'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'On‑call rota; comms templates.' },
      { id: 'A.5.27', title: 'Learning from information security incidents', description: 'Post‑incident reviews and improvements.', controlStatus: pickStatus('A.5.27'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: 'RCA and corrective actions tracked.' },
      { id: 'A.5.28', title: 'Collection of evidence', description: 'Admissible evidence collection and handling.', controlStatus: pickStatus('A.5.28'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT], implementationNotes: 'Chain‑of‑custody procedures documented.' },
      { id: 'A.5.29', title: 'Information security during disruption', description: 'Maintain security during business disruptions.', controlStatus: pickStatus('A.5.29'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.5.29') },
      { id: 'A.5.30', title: 'ICT readiness for business continuity', description: 'Ensure ICT is ready to support continuity.', controlStatus: pickStatus('A.5.30'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.5.30') },
      { id: 'A.5.31', title: 'Legal, statutory, regulatory and contractual requirements', description: 'Identify and comply with applicable obligations.', controlStatus: pickStatus('A.5.31'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT], implementationNotes: 'Obligations register maintained; quarterly review.' },
      { id: 'A.5.32', title: 'Intellectual property rights', description: 'Protect intellectual property.', controlStatus: pickStatus('A.5.32'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT], implementationNotes: 'Licensing compliance monitored.' },
      { id: 'A.5.33', title: 'Protection of records', description: 'Protect records from loss, destruction, falsification and unauthorised access.', controlStatus: pickStatus('A.5.33'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'Retention schedules applied.' },
      { id: 'A.5.34', title: 'Privacy and protection of personally identifiable information (PII)', description: 'Protect PII in line with applicable laws.', controlStatus: pickStatus('A.5.34'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT], implementationNotes: 'PIAs performed for new processing.' },
      { id: 'A.5.35', title: 'Independent review of information security', description: 'Independent reviews of the ISMS.', controlStatus: pickStatus('A.5.35'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: 'Annual internal audit programme.' },
      { id: 'A.5.36', title: 'Compliance with policies, rules and standards for information security', description: 'Ensure compliance with policies and standards.', controlStatus: pickStatus('A.5.36'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'Exception process with approvals.' },
      { id: 'A.5.37', title: 'Documented operating procedures', description: 'Document and maintain operating procedures.', controlStatus: pickStatus('A.5.37'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'Runbooks in central repository.' }
    ]
  },
  {
    id: 'A.6',
    title: 'People Controls',
    description: 'HR security, awareness, disciplinary and reporting.',
    controls: [
      { id: 'A.6.1', title: 'Screening', description: 'Background verification for candidates and employees.', controlStatus: pickStatus('A.6.1'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Pre‑employment checks per role risk.' },
      { id: 'A.6.2', title: 'Terms and conditions of employment', description: 'Security responsibilities in contracts.', controlStatus: pickStatus('A.6.2'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'Standard security clauses included.' },
      { id: 'A.6.3', title: 'Information security awareness, education and training', description: 'Awareness and training programme.', controlStatus: pickStatus('A.6.3'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: 'Annual training and phishing tests.' },
      { id: 'A.6.4', title: 'Disciplinary process', description: 'Handle breaches with a formal process.', controlStatus: pickStatus('A.6.4'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'HR & Legal manage escalations.' },
      { id: 'A.6.5', title: 'Responsibilities after termination or change of employment', description: 'Responsibilities continue post‑employment.', controlStatus: pickStatus('A.6.5'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'NDA reminders on exit.' },
      { id: 'A.6.6', title: 'Confidentiality or non‑disclosure agreements', description: 'NDAs with personnel and third parties.', controlStatus: pickStatus('A.6.6'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT], implementationNotes: 'Templates maintained by Legal.' },
      { id: 'A.6.7', title: 'Remote working', description: 'Security for remote work arrangements.', controlStatus: pickStatus('A.6.7'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.6.7') },
      { id: 'A.6.8', title: 'Information security event reporting', description: 'Report observed events and weaknesses.', controlStatus: pickStatus('A.6.8'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT], implementationNotes: 'Multiple reporting channels.' }
    ]
  },
  {
    id: 'A.7',
    title: 'Physical Controls',
    description: 'Facility and environmental protection.',
    controls: [
      { id: 'A.7.1',  title: 'Physical security perimeters', description: 'Define and protect secure areas.', controlStatus: pickStatus('A.7.1'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Zoned perimeters; controlled access points.' },
      { id: 'A.7.2',  title: 'Physical entry', description: 'Control access to secure areas.', controlStatus: pickStatus('A.7.2'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Badging and visitor logging.' },
      { id: 'A.7.3',  title: 'Securing offices, rooms and facilities', description: 'Protect offices and facilities.', controlStatus: pickStatus('A.7.3'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Locks, alarms and mantraps where appropriate.' },
      { id: 'A.7.4',  title: 'Physical security monitoring', description: 'Monitor physical security events.', controlStatus: pickStatus('A.7.4'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.7.4') },
      { id: 'A.7.5',  title: 'Protecting against physical and environmental threats', description: 'Protect against external and environmental threats.', controlStatus: pickStatus('A.7.5'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Fire suppression and flood detection where relevant.' },
      { id: 'A.7.6',  title: 'Working in secure areas', description: 'Control work conducted in secure areas.', controlStatus: pickStatus('A.7.6'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: 'Escort policy and clean‑desk enforced.' },
      { id: 'A.7.7',  title: 'Clear desk and clear screen', description: 'Reduce risk of information exposure.', controlStatus: pickStatus('A.7.7'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: 'Periodic floor walks.' },
      { id: 'A.7.8',  title: 'Equipment siting and protection', description: 'Protect equipment from risks and hazards.', controlStatus: pickStatus('A.7.8'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Secure racks; environmental tolerances monitored.' },
      { id: 'A.7.9',  title: 'Security of assets off‑premises', description: 'Protect assets outside the organisation.', controlStatus: pickStatus('A.7.9'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Loan registers; encryption at rest.' },
      { id: 'A.7.10', title: 'Storage media', description: 'Manage storage media throughout its lifecycle.', controlStatus: pickStatus('A.7.10'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Logging, transport controls, destruction certificates.' },
      { id: 'A.7.11', title: 'Supporting utilities', description: 'Protect from utility supply failures.', controlStatus: pickStatus('A.7.11'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'UPS, generators; failover tested.' },
      { id: 'A.7.12', title: 'Cabling security', description: 'Protect power and telecom cabling.', controlStatus: pickStatus('A.7.12'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Conduits and tamper detection where feasible.' },
      { id: 'A.7.13', title: 'Equipment maintenance', description: 'Maintain equipment securely.', controlStatus: pickStatus('A.7.13'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: 'Vendor maintenance with access controls.' },
      { id: 'A.7.14', title: 'Secure disposal or re‑use of equipment', description: 'Sanitise equipment prior to disposal or reuse.', controlStatus: pickStatus('A.7.14'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Wipe/Destroy per standard; records retained.' }
    ]
  },
  {
    id: 'A.8',
    title: 'Technological Controls',
    description: 'Technology‑centric controls including access, malware, backup, logging and SDLC.',
    controls: [
      { id: 'A.8.1',  title: 'User end point devices', description: 'Manage endpoint device security.', controlStatus: pickStatus('A.8.1'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.8.1') },
      { id: 'A.8.2',  title: 'Privileged access rights', description: 'Control and monitor privileged access.', controlStatus: pickStatus('A.8.2'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'PAM/JIT elevation; full session logging.' },
      { id: 'A.8.3',  title: 'Information access restriction', description: 'Restrict access to information and functions.', controlStatus: pickStatus('A.8.3'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT], implementationNotes: 'RBAC tied to classification.' },
      { id: 'A.8.4',  title: 'Access to source code', description: 'Restrict and monitor access to source code.', controlStatus: pickStatus('A.8.4'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Branch protections; signed commits where feasible.' },
      { id: 'A.8.5',  title: 'Secure authentication', description: 'Implement strong authentication mechanisms.', controlStatus: pickStatus('A.8.5'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'MFA and phishing‑resistant factors where feasible.' },
      { id: 'A.8.6',  title: 'Capacity management', description: 'Monitor and manage capacity.', controlStatus: pickStatus('A.8.6'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'Autoscaling and alert thresholds defined.' },
      { id: 'A.8.7',  title: 'Protection against malware', description: 'Protect against malware and malicious code.', controlStatus: pickStatus('A.8.7'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'EDR, email security and sandboxing.' },
      { id: 'A.8.8',  title: 'Management of technical vulnerabilities', description: 'Identify, assess and treat vulnerabilities.', controlStatus: pickStatus('A.8.8'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.8.8') },
      { id: 'A.8.9',  title: 'Configuration management', description: 'Establish and manage secure configurations.', controlStatus: pickStatus('A.8.9'),  controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.8.9') },
      { id: 'A.8.10', title: 'Information deletion', description: 'Delete information securely when no longer required.', controlStatus: pickStatus('A.8.10'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.8.10') },
      { id: 'A.8.11', title: 'Data masking', description: 'Mask data to limit exposure.', controlStatus: pickStatus('A.8.11'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.8.11') },
      { id: 'A.8.12', title: 'Data leakage prevention', description: 'Prevent unauthorised exfiltration of data.', controlStatus: pickStatus('A.8.12'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.8.12') },
      { id: 'A.8.13', title: 'Information backup', description: 'Backup and restore information.', controlStatus: pickStatus('A.8.13'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: note('A.8.13') },
      { id: 'A.8.14', title: 'Redundancy of information processing facilities', description: 'Ensure availability via redundancy.', controlStatus: pickStatus('A.8.14'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Multi‑AZ/region where justified.' },
      { id: 'A.8.15', title: 'Logging', description: 'Generate, protect and retain logs.', controlStatus: pickStatus('A.8.15'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT], implementationNotes: note('A.8.15') },
      { id: 'A.8.16', title: 'Monitoring activities', description: 'Monitor systems and networks for events.', controlStatus: pickStatus('A.8.16'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.8.16') },
      { id: 'A.8.17', title: 'Clock synchronisation', description: 'Synchronise system clocks.', controlStatus: pickStatus('A.8.17'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: 'NTP enforced; drift alerts configured.' },
      { id: 'A.8.18', title: 'Use of privileged utility programs', description: 'Control privileged utilities usage.', controlStatus: pickStatus('A.8.18'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Allow‑list and session recording.' },
      { id: 'A.8.19', title: 'Installation of software on operational systems', description: 'Control software installation on production.', controlStatus: pickStatus('A.8.19'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Change control and approvals.' },
      { id: 'A.8.20', title: 'Networks security', description: 'Secure networks and services.', controlStatus: pickStatus('A.8.20'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Segmentation, firewalls and IDS/IPS.' },
      { id: 'A.8.21', title: 'Security of network services', description: 'Agree and manage security of network services.', controlStatus: pickStatus('A.8.21'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'SLAs and security specs in contracts.' },
      { id: 'A.8.22', title: 'Segregation of networks', description: 'Segregate networks to reduce risk.', controlStatus: pickStatus('A.8.22'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Tiered environments and zero‑trust zoning.' },
      { id: 'A.8.23', title: 'Web filtering', description: 'Filter web access to reduce risk.', controlStatus: pickStatus('A.8.23'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.8.23') },
      { id: 'A.8.24', title: 'Use of cryptography', description: 'Appropriate and effective use of cryptography.', controlStatus: pickStatus('A.8.24'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Key management and approved ciphers.' },
      { id: 'A.8.25', title: 'Secure development life cycle', description: 'Embed security in the SDLC.', controlStatus: pickStatus('A.8.25'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: 'SDL activities mapped to stages.' },
      { id: 'A.8.26', title: 'Application security requirements', description: 'Define and enforce application security requirements.', controlStatus: pickStatus('A.8.26'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.8.26') },
      { id: 'A.8.27', title: 'Secure system architecture and engineering principles', description: 'Apply security architecture and engineering principles.', controlStatus: pickStatus('A.8.27'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE], implementationNotes: note('A.8.27') },
      { id: 'A.8.28', title: 'Secure coding', description: 'Follow secure coding practices.', controlStatus: pickStatus('A.8.28'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Standards aligned with OWASP; peer reviews enforced.' },
      { id: 'A.8.29', title: 'Security testing in development and acceptance', description: 'Plan and perform security testing.', controlStatus: pickStatus('A.8.29'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: note('A.8.29') },
      { id: 'A.8.30', title: 'Outsourced development', description: 'Manage security in outsourced development.', controlStatus: pickStatus('A.8.30'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'Security clauses and code reviews for vendors.' },
      { id: 'A.8.31', title: 'Separation of development, test and production environments', description: 'Separate environments to reduce risk.', controlStatus: pickStatus('A.8.31'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Access boundaries enforced.' },
      { id: 'A.8.32', title: 'Change management', description: 'Control changes to systems and services.', controlStatus: pickStatus('A.8.32'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT], implementationNotes: 'CAB‑lite approvals with audit trail.' },
      { id: 'A.8.33', title: 'Test information', description: 'Protect and manage test data and environments.', controlStatus: pickStatus('A.8.33'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Anonymised data in non‑prod.' },
      { id: 'A.8.34', title: 'Protection of information systems during audit testing', description: 'Protect systems during audit/testing activities.', controlStatus: pickStatus('A.8.34'), controlApplicability: 'Applicable', relatedRisks: [], justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT], implementationNotes: 'Change freezes and scopes agreed.' }
    ]
  }
];

class SoASetupManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async connect() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db('cycorgi');
    this.collection = this.db.collection('soa_controls');
    console.log('✅ Connected to MongoDB');
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('✅ Disconnected from MongoDB');
    }
  }

  async migrateExistingControls() {
    console.log('\\n🔄 Migrating existing SOA controls...');
    
    try {
      const existingControls = await this.collection.find({}).toArray();
      
      if (existingControls.length === 0) {
        console.log('📝 No existing controls found - will proceed with fresh seeding');
        return;
      }

      console.log(`📋 Found ${existingControls.length} existing controls`);

      const updates = [];

      for (const control of existingControls) {
        const updateDoc = { updatedAt: new Date().toISOString() };
        let needsUpdate = false;

        // 1) Rename 'status' -> 'controlStatus'
        if (control.status && !control.controlStatus) {
          updateDoc.controlStatus = normalisePlanned(control.status);
          updateDoc.$unset = { status: "" };
          needsUpdate = true;
        }

        // 2) Ensure 'controlStatus' value normalisation
        if (control.controlStatus && control.controlStatus === 'Planned') {
          updateDoc.controlStatus = 'Planning Implementation';
          needsUpdate = true;
        }

        // 3) Add 'controlApplicability' if missing
        if (!control.controlApplicability) {
          updateDoc.controlApplicability = 'Applicable';
          needsUpdate = true;
        }

        // 4) Initialise 'relatedRisks' if missing
        if (!Array.isArray(control.relatedRisks)) {
          updateDoc.relatedRisks = [];
          needsUpdate = true;
        }

        // 5) Convert justification to array and map values
        if (control.justification) {
          if (!Array.isArray(control.justification)) {
            const mapped = this.mapOldJustificationToNew(control.justification);
            updateDoc.justification = [mapped];
            needsUpdate = true;
          }
        } else {
          updateDoc.justification = [CONTROL_JUSTIFICATION.BEST_PRACTICE];
          needsUpdate = true;
        }

        if (needsUpdate) {
          updates.push({
            updateOne: {
              filter: { _id: control._id },
              update: updateDoc.$unset ? 
                { $set: updateDoc, $unset: updateDoc.$unset } : 
                { $set: updateDoc }
            }
          });
        }
      }

      if (updates.length > 0) {
        const result = await this.collection.bulkWrite(updates);
        console.log(`✅ Successfully migrated ${result.modifiedCount} controls`);
      } else {
        console.log('✅ All controls already properly migrated');
      }

      // Update indexes
      await this.updateIndexes();

    } catch (error) {
      console.error('❌ Error during migration:', error);
      throw error;
    }
  }

  mapOldJustificationToNew(oldJustification) {
    const justificationMap = {
      'Best Practice': CONTROL_JUSTIFICATION.BEST_PRACTICE,
      'Legal Requirement': CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT,
      'Regulatory Requirement': CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT,
      'Business Requirement': CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT,
      'Risk Management Requirement': CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT,
      // Legacy text to standard value examples
      'Critical functions have appropriate segregation': CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT,
      'Executive management actively supports security initiatives': CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT,
      'Established relationships with relevant authorities': CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT,
      'Active participation in industry security groups': CONTROL_JUSTIFICATION.BEST_PRACTICE,
      'Threat intelligence feeds integrated into security monitoring': CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT
    };
    return justificationMap[oldJustification] || CONTROL_JUSTIFICATION.BEST_PRACTICE;
  }

  async updateIndexes() {
    console.log('🔧 Updating database indexes...');
    try {
      // Drop obsolete index if present
      try {
        await this.collection.dropIndex('status_1');
        console.log('   Dropped old "status_1" index');
      } catch (e) {}
      // Drop existing id index(es) then recreate with stable name
      try { await this.collection.dropIndex('id_unique'); } catch (e) {}
      try { await this.collection.dropIndex('id_1'); } catch (e) {}
      await this.collection.createIndex({ id: 1 }, { unique: true, name: 'id_unique' });
      await this.collection.createIndex({ controlStatus: 1 });
      await this.collection.createIndex({ controlApplicability: 1 });
      await this.collection.createIndex({ justification: 1 });
      await this.collection.createIndex({ relatedRisks: 1 });
      console.log('✅ Updated database indexes');
    } catch (error) {
      console.error('⚠️  Warning: Could not update indexes:', error.message);
    }
  }

  async fetchExistingRisks() {
    console.log('🔍 Fetching existing risks...');
    try {
      const risksCollection = this.db.collection('risks');
      const risks = await risksCollection.find({}, { projection: { riskId: 1 } }).toArray();
      const riskIds = risks.map(risk => risk.riskId).filter(Boolean);
      console.log(`📋 Found ${riskIds.length} existing risks${riskIds.length ? ' (sample: ' + riskIds.slice(0,5).join(', ') + (riskIds.length>5?'...':'') + ')' : ''}`);
      return riskIds;
    } catch (error) {
      console.error('⚠️  Warning: Could not fetch risks:', error.message);
      return [];
    }
  }

  // Seed all 93 controls
  async seedControls() {
    console.log('\\n🌱 Seeding SOA controls...');
    try {
      // Clear existing controls to avoid duplicates
      await this.collection.deleteMany({});
      console.log('🗑️  Cleared existing SoA controls');

      // Fetch existing risks for relationships
      const existingRiskIds = await this.fetchExistingRisks();

      // Prepare controls for insertion
      const controlsToInsert = [];
      let totalRiskAssociations = 0;

      function sampleRelated() {
        if (!existingRiskIds.length) return [];
        const count = Math.floor(Math.random() * 4) + 3; // 3-6
        const shuffled = [...existingRiskIds].sort(() => 0.5 - Math.random());
        const slice = shuffled.slice(0, Math.min(6, Math.max(3, count), existingRiskIds.length));
        return slice;
      }

      for (const set of controlSets) {
        for (const c of set.controls) {
          const doc = {
            id: c.id,
            title: c.title,
            description: c.description,
            controlStatus: normalisePlanned(c.controlStatus),
            controlApplicability: c.controlApplicability,
            relatedRisks: sampleRelated(),
            justification: c.justification,
            implementationNotes: c.implementationNotes || '',
            controlSetId: set.id,
            controlSetTitle: set.title,
            controlSetDescription: set.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          totalRiskAssociations += doc.relatedRisks.length;
          controlsToInsert.push(doc);
        }
      }

      const result = await this.collection.insertMany(controlsToInsert);
      console.log(`✅ Successfully seeded ${result.insertedCount} SoA controls`);
      if (existingRiskIds.length > 0) {
        console.log(`🔗 Total related risk associations: ${totalRiskAssociations}`);
        console.log(`📊 Average related risks per control: ${(totalRiskAssociations / controlsToInsert.length).toFixed(1)}`);
      }

      // Create indexes
      await this.updateIndexes();

      // Show a quick sample
      await this.showSample();

    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }

  async showSample() {
    console.log('\\n📋 Sample seeded controls:');
    const sampleControls = await this.collection.find({}).limit(5).toArray();
    sampleControls.forEach((control, index) => {
      console.log(`   ${index + 1}. ${control.id}: "${control.title}"`);
      console.log(`      Status: ${control.controlStatus} | Applicability: ${control.controlApplicability}`);
      console.log(`      Justifications: ${Array.isArray(control.justification) ? control.justification.join(', ') : ''}`);
      console.log(`      Related Risks: ${Array.isArray(control.relatedRisks) ? control.relatedRisks.length : 0} risks`);
    });

    const justificationStats = await this.collection.aggregate([
      { $unwind: '$justification' },
      { $group: { _id: '$justification', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log('\\n📊 Justification distribution:');
    justificationStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} controls`);
    });
  }

  async run() {
    try {
      await this.connect();
      console.log('🚀 Starting complete SOA setup...');
      console.log('   Phase 1: Migrate existing controls');
      await this.migrateExistingControls();
      console.log('   Phase 2: Seed new controls (93 controls)');
      await this.seedControls();
      console.log('\\n🎉 SOA setup completed successfully!');
      console.log('   ✅ Schema migrated (array justifications, normalised statuses)');
      console.log('   ✅ All 93 controls seeded with realistic values');
      console.log('   ✅ Database indexes rebuilt');
    } catch (error) {
      console.error('\\n💥 SOA setup failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Allow script to be run directly or imported
if (require.main === module) {
  const setupManager = new SoASetupManager();
  setupManager.run().catch(console.error);
}

module.exports = { SoASetupManager, CONTROL_JUSTIFICATION, controlSets };
