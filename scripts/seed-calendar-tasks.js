/* eslint-disable no-console */
const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// ========================== CONFIG ==========================
const ALLOW_PURGE = true; // set false to avoid wiping existing data
const ALLOW_INDEX_REPAIR = (process.env.ALLOW_INDEX_REPAIR || 'true') === 'true';

// ==================== ENV LOADER (.env.local) =================
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [rawKey, ...valueParts] = line.split('=');
    const key = (rawKey || '').trim();
    if (!key || key.startsWith('#') || valueParts.length === 0) return;
    const value = valueParts.join('=').trim();
    envVars[key] = value.replace(/^[\"']|[\"']$/g, '');
  });
  Object.entries(envVars).forEach(([k, v]) => (process.env[k] = v));
}
loadEnvFile();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.log('💡 Ensure .env.local contains MONGODB_URI=your_connection_string');
  process.exit(1);
}
console.log(`📡 Using URI: ${MONGODB_URI.substring(0, 20)}...`);

// ===================== DATE HELPERS ==========================
const now = new Date();
/** month: 1-12, returns UTC date at midnight */
function d(y, m, day) {
  return new Date(Date.UTC(y, m - 1, day, 0, 0, 0));
}

// ======================= SEED DATA ===========================
const calendarTasks = [
  // Governance / ISMS Core
  {
    taskId: 'TASK-001',
    plannedDate: d(2025, 1, 15),
    taskName: 'Annual ISMS Internal Audit Planning',
    functionalUnit: 'GRC',
    agileReleaseTrain: 'ART-1',
    frequency: 'Annual',
    output: 'Internal Audit Programme 2025',
    taskOwner: 'Paul Pena',
    supportFromART: 'Yes',
    dueDate: d(2025, 1, 31),
    taskJiraTicket: 'ISMS-IA-2025-PLAN',
    confluenceLink: 'https://confluence.company.com/isms/internal-audit-programme',
    notes: 'Define scope, criteria, and schedule per ISO 27001 clause 9.2.',
    category: 'governance',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-002',
    plannedDate: d(2025, 2, 10),
    taskName: 'Management Review Q1',
    functionalUnit: 'GRC',
    agileReleaseTrain: 'ART-1',
    frequency: 'Quarterly',
    output: 'Management Review Minutes',
    taskOwner: 'CISO',
    supportFromART: 'No',
    dueDate: d(2025, 2, 14),
    taskJiraTicket: 'ISMS-MR-2025-Q1',
    confluenceLink: 'https://confluence.company.com/isms/management-review',
    notes: 'Include KPIs, audit results, risks, SoA status (ISO 27001 9.3).',
    category: 'governance',
    createdAt: now,
    updatedAt: now,
  },

  // Risk Management
  {
    taskId: 'TASK-003',
    plannedDate: d(2025, 1, 20),
    taskName: 'Quarterly Risk Register Update',
    functionalUnit: 'Risk Management',
    agileReleaseTrain: 'ART-2',
    frequency: 'Quarterly',
    output: 'Updated Risk Register',
    taskOwner: 'Jane Smith',
    supportFromART: 'No',
    dueDate: d(2025, 2, 3),
    taskJiraTicket: 'RISK-2025-Q1',
    confluenceLink: 'https://confluence.company.com/risk/register',
    notes: 'Reassess top risks; include new treatments and KRIs.',
    category: 'risk',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-004',
    plannedDate: d(2025, 3, 5),
    taskName: 'Risk Workshop — Data Modelling Sandbox (GCP)',
    functionalUnit: 'Risk Management',
    agileReleaseTrain: 'ART-3',
    frequency: 'Ad-hoc',
    output: 'Risk Workshop Outcomes',
    taskOwner: 'Paul Pena',
    supportFromART: 'Yes',
    dueDate: d(2025, 3, 7),
    taskJiraTicket: 'RISK-WS-2025-01',
    confluenceLink: 'https://confluence.company.com/risk/workshops/gcp-sandbox',
    notes: 'Focus on read-only EDP access, data ingestion hygiene, and SoA mapping.',
    category: 'risk',
    createdAt: now,
    updatedAt: now,
  },

  // Compliance / External
  {
    taskId: 'TASK-005',
    plannedDate: d(2025, 2, 20),
    taskName: 'Third-Party Security Risk Assessments — Q1 Batch',
    functionalUnit: 'Third-Party Risk',
    agileReleaseTrain: 'ART-2',
    frequency: 'Quarterly',
    output: 'Supplier Risk Reports',
    taskOwner: 'Eddy Hughes',
    supportFromART: 'Yes',
    dueDate: d(2025, 3, 15),
    taskJiraTicket: 'TPRM-2025-Q1',
    confluenceLink: 'https://confluence.company.com/tprm/assessments',
    notes: 'Prioritise high-spend, high-data suppliers.',
    category: 'third-party',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-006',
    plannedDate: d(2025, 4, 8),
    taskName: 'PCI-DSS Scope Validation (PayDollar)',
    functionalUnit: 'Compliance',
    agileReleaseTrain: 'ART-1',
    frequency: 'Annual',
    output: 'Scope Validation Memo',
    taskOwner: 'Rizwan Ali',
    supportFromART: 'No',
    dueDate: d(2025, 4, 19),
    taskJiraTicket: 'PCI-2025-SCOPE',
    confluenceLink: 'https://confluence.company.com/compliance/pci',
    notes: 'Confirm SAQ-A remains applicable; validate any new payment flows.',
    category: 'compliance',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-007',
    plannedDate: d(2025, 5, 6),
    taskName: 'GDPR Annual Review — Records of Processing',
    functionalUnit: 'Privacy',
    agileReleaseTrain: 'ART-1',
    frequency: 'Annual',
    output: 'Updated RoPA',
    taskOwner: 'DPO',
    supportFromART: 'No',
    dueDate: d(2025, 5, 23),
    taskJiraTicket: 'PRIV-ROPA-2025',
    confluenceLink: 'https://confluence.company.com/privacy/ropa',
    notes: 'Verify legal bases, retention, and international transfers.',
    category: 'privacy',
    createdAt: now,
    updatedAt: now,
  },

  // Operations / Monitoring / Vulnerability
  {
    taskId: 'TASK-008',
    plannedDate: d(2025, 1, 8),
    taskName: 'Weekly Security Monitoring Review',
    functionalUnit: 'SOC',
    agileReleaseTrain: 'ART-1',
    frequency: 'Weekly',
    output: 'Monitoring Summary',
    taskOwner: 'Mike Johnson',
    supportFromART: 'Yes',
    dueDate: d(2025, 1, 9),
    taskJiraTicket: 'SOC-MON-2025-W01',
    confluenceLink: 'https://confluence.company.com/soc/monitoring',
    notes: 'SIEM alerts, anomalies, and response metrics.',
    category: 'operations',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-009',
    plannedDate: d(2025, 2, 3),
    taskName: 'Monthly Vulnerability Scan & Review',
    functionalUnit: 'Security Operations',
    agileReleaseTrain: 'ART-1',
    frequency: 'Monthly',
    output: 'Vulnerability Report',
    taskOwner: 'John Doe',
    supportFromART: 'Yes',
    dueDate: d(2025, 2, 5),
    taskJiraTicket: 'VULN-2025-02',
    confluenceLink: 'https://confluence.company.com/vuln/scans',
    notes: 'Prioritise CVSS >= 7.0 and internet-exposed assets.',
    category: 'operations',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-010',
    plannedDate: d(2025, 3, 12),
    taskName: 'Patch Management — Q1 Criticals Closure',
    functionalUnit: 'IT Operations',
    agileReleaseTrain: 'ART-2',
    frequency: 'Quarterly',
    output: 'Patch Closure Report',
    taskOwner: 'Sarah Wilson',
    supportFromART: 'Yes',
    dueDate: d(2025, 3, 28),
    taskJiraTicket: 'PATCH-2025-Q1',
    confluenceLink: 'https://confluence.company.com/itops/patching',
    notes: 'Criticals within SLA; exceptions documented.',
    category: 'operations',
    createdAt: now,
    updatedAt: now,
  },

  // Incident Management
  {
    taskId: 'TASK-011',
    plannedDate: d(2025, 2, 17),
    taskName: 'Incident Response Tabletop — Phishing Campaign',
    functionalUnit: 'SOC',
    agileReleaseTrain: 'ART-1',
    frequency: 'Quarterly',
    output: 'Tabletop Report',
    taskOwner: 'Mike Johnson',
    supportFromART: 'Yes',
    dueDate: d(2025, 2, 17),
    taskJiraTicket: 'IR-TTX-2025-Q1',
    confluenceLink: 'https://confluence.company.com/ir/exercises',
    notes: 'Cover detection, containment, forensics, comms, lessons learned.',
    category: 'operations',
    createdAt: now,
    updatedAt: now,
  },

  // Business Continuity / DR
  {
    taskId: 'TASK-012',
    plannedDate: d(2025, 4, 15),
    taskName: 'Backup Restore Test — Critical DB',
    functionalUnit: 'IT Operations',
    agileReleaseTrain: 'ART-1',
    frequency: 'Semi-Annual',
    output: 'Restore Test Evidence',
    taskOwner: 'Alex Brown',
    supportFromART: 'No',
    dueDate: d(2025, 4, 16),
    taskJiraTicket: 'BCP-BACKUP-2025-1',
    confluenceLink: 'https://confluence.company.com/bcp/backups',
    notes: 'Restore within RTO/RPO; cross-verify data integrity.',
    category: 'business-continuity',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-013',
    plannedDate: d(2025, 6, 4),
    taskName: 'DR Failover Exercise — Cloud Run Services',
    functionalUnit: 'Platform Engineering',
    agileReleaseTrain: 'ART-3',
    frequency: 'Annual',
    output: 'Failover Report',
    taskOwner: 'DevOps Lead',
    supportFromART: 'Yes',
    dueDate: d(2025, 6, 6),
    taskJiraTicket: 'DR-EX-2025-CR',
    confluenceLink: 'https://confluence.company.com/dr/failover',
    notes: 'Validate traffic cutover, DNS TTLs, and rollback.',
    category: 'business-continuity',
    createdAt: now,
    updatedAt: now,
  },

  // Training & Awareness
  {
    taskId: 'TASK-014',
    plannedDate: d(2025, 1, 30),
    taskName: 'Secure Coding Training (OWASP Top 10)',
    functionalUnit: 'Engineering',
    agileReleaseTrain: 'ART-2',
    frequency: 'Quarterly',
    output: 'Completion Records',
    taskOwner: 'Eng Manager',
    supportFromART: 'Yes',
    dueDate: d(2025, 2, 7),
    taskJiraTicket: 'TRAIN-SC-2025-Q1',
    confluenceLink: 'https://confluence.company.com/training/secure-coding',
    notes: 'Include code review and SAST intro.',
    category: 'training',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-015',
    plannedDate: d(2025, 3, 20),
    taskName: 'Company-wide Phishing Simulation — Q1',
    functionalUnit: 'Security Awareness',
    agileReleaseTrain: 'ART-1',
    frequency: 'Quarterly',
    output: 'Campaign Results & Remediation',
    taskOwner: 'Awareness Lead',
    supportFromART: 'No',
    dueDate: d(2025, 3, 21),
    taskJiraTicket: 'AWARE-PHISH-2025-Q1',
    confluenceLink: 'https://confluence.company.com/awareness/phishing',
    notes: 'Track click rate, report rate, training follow-ups.',
    category: 'training',
    createdAt: now,
    updatedAt: now,
  },

  // Engineering / SDLC
  {
    taskId: 'TASK-016',
    plannedDate: d(2025, 2, 24),
    taskName: 'SAST Coverage Review — Core Repos',
    functionalUnit: 'AppSec',
    agileReleaseTrain: 'ART-2',
    frequency: 'Quarterly',
    output: 'Coverage & Gap Analysis',
    taskOwner: 'AppSec Lead',
    supportFromART: 'Yes',
    dueDate: d(2025, 3, 3),
    taskJiraTicket: 'APPSEC-SAST-2025-Q1',
    confluenceLink: 'https://confluence.company.com/appsec/sast',
    notes: 'Ensure pipelines enforce minimum quality gates.',
    category: 'engineering',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-017',
    plannedDate: d(2025, 5, 1),
    taskName: 'DAST on Customer Portal',
    functionalUnit: 'AppSec',
    agileReleaseTrain: 'ART-3',
    frequency: 'Semi-Annual',
    output: 'DAST Report & Fix Plan',
    taskOwner: 'AppSec Lead',
    supportFromART: 'Yes',
    dueDate: d(2025, 5, 14),
    taskJiraTicket: 'APPSEC-DAST-PORTAL-2025-1',
    confluenceLink: 'https://confluence.company.com/appsec/dast',
    notes: 'Authenticated scans; coordinate with release schedule.',
    category: 'engineering',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-018',
    plannedDate: d(2025, 4, 2),
    taskName: 'Dependency SBOM & License Review',
    functionalUnit: 'AppSec',
    agileReleaseTrain: 'ART-2',
    frequency: 'Quarterly',
    output: 'SBOM & License Exceptions',
    taskOwner: 'AppSec Lead',
    supportFromART: 'No',
    dueDate: d(2025, 4, 10),
    taskJiraTicket: 'SBOM-2025-Q2',
    confluenceLink: 'https://confluence.company.com/appsec/sbom',
    notes: 'Identify critical CVEs and problematic licenses.',
    category: 'engineering',
    createdAt: now,
    updatedAt: now,
  },

  // Identity & Access
  {
    taskId: 'TASK-019',
    plannedDate: d(2025, 2, 6),
    taskName: 'Quarterly Access Review — Privileged Accounts',
    functionalUnit: 'IT Security',
    agileReleaseTrain: 'ART-1',
    frequency: 'Quarterly',
    output: 'Access Review Sign-offs',
    taskOwner: 'IT Sec Lead',
    supportFromART: 'No',
    dueDate: d(2025, 2, 13),
    taskJiraTicket: 'IAM-REV-2025-Q1',
    confluenceLink: 'https://confluence.company.com/iam/reviews',
    notes: 'Review admin, service, and break-glass accounts.',
    category: 'operations',
    createdAt: now,
    updatedAt: now,
  },

  // Logging & Monitoring
  {
    taskId: 'TASK-020',
    plannedDate: d(2025, 1, 27),
    taskName: 'Log Retention & Integrity Check',
    functionalUnit: 'SOC',
    agileReleaseTrain: 'ART-1',
    frequency: 'Monthly',
    output: 'Log Retention Evidence',
    taskOwner: 'SOC Analyst',
    supportFromART: 'No',
    dueDate: d(2025, 1, 28),
    taskJiraTicket: 'LOGS-2025-01',
    confluenceLink: 'https://confluence.company.com/soc/logging',
    notes: 'Verify WORM or integrity controls and retention periods.',
    category: 'operations',
    createdAt: now,
    updatedAt: now,
  },

  // Cloud / Platform Security
  {
    taskId: 'TASK-021',
    plannedDate: d(2025, 3, 10),
    taskName: 'CSPM Review — GCP Projects',
    functionalUnit: 'Cloud Security',
    agileReleaseTrain: 'ART-3',
    frequency: 'Monthly',
    output: 'CSPM Findings & Remediation',
    taskOwner: 'Cloud Sec Lead',
    supportFromART: 'Yes',
    dueDate: d(2025, 3, 12),
    taskJiraTicket: 'CSPM-GCP-2025-03',
    confluenceLink: 'https://confluence.company.com/cloud/cspm',
    notes: 'Check IAM, network egress, public buckets, KMS usage.',
    category: 'operations',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-022',
    plannedDate: d(2025, 5, 22),
    taskName: 'Secrets Management Review — Vault Policies',
    functionalUnit: 'Platform Engineering',
    agileReleaseTrain: 'ART-3',
    frequency: 'Quarterly',
    output: 'Policy Review & Rotation Plan',
    taskOwner: 'DevOps Lead',
    supportFromART: 'Yes',
    dueDate: d(2025, 5, 28),
    taskJiraTicket: 'VAULT-REV-2025-Q2',
    confluenceLink: 'https://confluence.company.com/platform/vault',
    notes: 'Check TTLs, rotations, and app bindings (WIF).',
    category: 'operations',
    createdAt: now,
    updatedAt: now,
  },

  // Supplier & ICT Supply Chain
  {
    taskId: 'TASK-023',
    plannedDate: d(2025, 4, 18),
    taskName: 'ICT Supply Chain Risk Review',
    functionalUnit: 'Third-Party Risk',
    agileReleaseTrain: 'ART-2',
    frequency: 'Semi-Annual',
    output: 'Supply Chain Risk Report',
    taskOwner: 'Eddy Hughes',
    supportFromART: 'No',
    dueDate: d(2025, 4, 26),
    taskJiraTicket: 'TPRM-ICT-2025-H1',
    confluenceLink: 'https://confluence.company.com/tprm/ict-supply-chain',
    notes: 'Firmware, dependencies, and sub-processor mapping.',
    category: 'third-party',
    createdAt: now,
    updatedAt: now,
  },

  // Penetration Testing / Red Team
  {
    taskId: 'TASK-024',
    plannedDate: d(2025, 7, 7),
    taskName: 'External Penetration Test — Critical Services',
    functionalUnit: 'Security',
    agileReleaseTrain: 'ART-1',
    frequency: 'Annual',
    output: 'Pen Test Report & Remediation Plan',
    taskOwner: 'Security Lead',
    supportFromART: 'Yes',
    dueDate: d(2025, 7, 24),
    taskJiraTicket: 'PENTEST-2025-EXT',
    confluenceLink: 'https://confluence.company.com/testing/pentest',
    notes: 'Coordinate safe testing windows; track findings to closure.',
    category: 'audit',
    createdAt: now,
    updatedAt: now,
  },

  // Documentation & SoA
  {
    taskId: 'TASK-025',
    plannedDate: d(2025, 2, 27),
    taskName: 'SoA Review — Annex A Alignment',
    functionalUnit: 'GRC',
    agileReleaseTrain: 'ART-1',
    frequency: 'Semi-Annual',
    output: 'Updated SoA',
    taskOwner: 'Paul Pena',
    supportFromART: 'No',
    dueDate: d(2025, 3, 6),
    taskJiraTicket: 'ISMS-SOA-2025-H1',
    confluenceLink: 'https://confluence.company.com/isms/soa',
    notes: 'Confirm control applicability and implementation status.',
    category: 'documentation',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-026',
    plannedDate: d(2025, 3, 18),
    taskName: 'Policy & Standard Review Cycle — Set 1',
    functionalUnit: 'GRC',
    agileReleaseTrain: 'ART-1',
    frequency: 'Annual',
    output: 'Approved Policy Updates',
    taskOwner: 'CISO',
    supportFromART: 'No',
    dueDate: d(2025, 4, 2),
    taskJiraTicket: 'POLICY-REV-2025-S1',
    confluenceLink: 'https://confluence.company.com/isms/policies',
    notes: 'Access Control, Acceptable Use, Supplier Security.',
    category: 'documentation',
    createdAt: now,
    updatedAt: now,
  },

  // Asset & Data Management
  {
    taskId: 'TASK-027',
    plannedDate: d(2025, 1, 22),
    taskName: 'Information Asset Inventory Reconciliation',
    functionalUnit: 'Asset Management',
    agileReleaseTrain: 'ART-2',
    frequency: 'Quarterly',
    output: 'Updated Asset Register',
    taskOwner: 'Asset Owner Group',
    supportFromART: 'No',
    dueDate: d(2025, 2, 4),
    taskJiraTicket: 'ASSET-INV-2025-Q1',
    confluenceLink: 'https://confluence.company.com/asset/register',
    notes: 'Map owners, classification, and backup status.',
    category: 'operations',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-028',
    plannedDate: d(2025, 5, 27),
    taskName: 'Data Retention & Deletion Controls Review',
    functionalUnit: 'Data Governance',
    agileReleaseTrain: 'ART-1',
    frequency: 'Semi-Annual',
    output: 'Deletion Evidence & Exceptions',
    taskOwner: 'Data Gov Lead',
    supportFromART: 'No',
    dueDate: d(2025, 6, 6),
    taskJiraTicket: 'DATA-RET-2025-H1',
    confluenceLink: 'https://confluence.company.com/data/retention',
    notes: 'Validate deletion for expired records and hold exceptions.',
    category: 'compliance',
    createdAt: now,
    updatedAt: now,
  },

  // Network & Platform
  {
    taskId: 'TASK-029',
    plannedDate: d(2025, 2, 4),
    taskName: 'Network Segmentation Review',
    functionalUnit: 'Network Engineering',
    agileReleaseTrain: 'ART-3',
    frequency: 'Semi-Annual',
    output: 'Segmentation Diagram & Gaps',
    taskOwner: 'Network Lead',
    supportFromART: 'Yes',
    dueDate: d(2025, 2, 18),
    taskJiraTicket: 'NET-SEG-2025-H1',
    confluenceLink: 'https://confluence.company.com/network/segmentation',
    notes: 'Review trust boundaries, ACLs, and east-west traffic.',
    category: 'operations',
    createdAt: now,
    updatedAt: now,
  },

  // AI / DPIA / Emerging Tech
  {
    taskId: 'TASK-030',
    plannedDate: d(2025, 3, 25),
    taskName: 'AI Impact Assessment — New Analytics Feature',
    functionalUnit: 'GRC',
    agileReleaseTrain: 'ART-2',
    frequency: 'Ad-hoc',
    output: 'AIIA Report & Controls',
    taskOwner: 'Paul Pena',
    supportFromART: 'Yes',
    dueDate: d(2025, 4, 4),
    taskJiraTicket: 'AIIA-2025-01',
    confluenceLink: 'https://confluence.company.com/risk/ai-impact',
    notes: 'Assess model inputs, bias, PII handling, model updates.',
    category: 'risk',
    createdAt: now,
    updatedAt: now,
  },
  {
    taskId: 'TASK-031',
    plannedDate: d(2025, 4, 29),
    taskName: 'DPIA — Customer Usage Telemetry',
    functionalUnit: 'Privacy',
    agileReleaseTrain: 'ART-1',
    frequency: 'Ad-hoc',
    output: 'DPIA & Mitigations',
    taskOwner: 'DPO',
    supportFromART: 'Yes',
    dueDate: d(2025, 5, 9),
    taskJiraTicket: 'DPIA-2025-UT',
    confluenceLink: 'https://confluence.company.com/privacy/dpia',
    notes: 'Review purpose limitation, minimisation, retention.',
    category: 'privacy',
    createdAt: now,
    updatedAt: now,
  },

  // Steering / Metrics
  {
    taskId: 'TASK-032',
    plannedDate: d(2025, 2, 25),
    taskName: 'Security Steering Committee — Q1',
    functionalUnit: 'GRC',
    agileReleaseTrain: 'ART-1',
    frequency: 'Quarterly',
    output: 'SSC Minutes & Actions',
    taskOwner: 'CISO',
    supportFromART: 'No',
    dueDate: d(2025, 2, 25),
    taskJiraTicket: 'SSC-2025-Q1',
    confluenceLink: 'https://confluence.company.com/ssc',
    notes: 'Discuss risk posture, compliance, incidents, and roadmap.',
    category: 'governance',
    createdAt: now,
    updatedAt: now,
  },
];

// =================== INDEX MANAGEMENT =======================
async function ensureIndexes(collection) {
  // Desired index specs
  const desired = {
    taskId: { key: { taskId: 1 }, options: { unique: true, name: 'taskId_1' } },
    catPlanned: { key: { category: 1, plannedDate: 1 }, options: {} },
    dueDate: { key: { dueDate: 1 }, options: {} },
    taskOwner: { key: { taskOwner: 1 }, options: {} },
  };

  const existing = await collection.indexes();

  // Helper to stringify keys reliably
  const keyEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  // --- Handle { taskId: 1 } uniqueness & name conflicts robustly
  const existingTaskId = existing.find(ix => keyEq(ix.key, desired.taskId.key));
  if (existingTaskId) {
    const conflict =
      existingTaskId.unique !== true || // unique mismatch
      existingTaskId.name !== desired.taskId.options.name; // name mismatch

    if (conflict) {
      if (!ALLOW_INDEX_REPAIR) {
        throw new Error(
          `Index conflict for {taskId:1}. Existing: name='${existingTaskId.name}', unique=${!!existingTaskId.unique}. ` +
          `Set ALLOW_INDEX_REPAIR=true to drop & recreate.`
        );
      }
      console.log(`🔧 Dropping conflicting index '${existingTaskId.name}' on {taskId:1}...`);
      await collection.dropIndex(existingTaskId.name);
    }
  }
  await collection.createIndex(desired.taskId.key, desired.taskId.options);
  console.log('✅ Ensured unique index on { taskId: 1 }');

  // --- Other indexes (idempotent)
  await collection.createIndex(desired.catPlanned.key, desired.catPlanned.options);
  await collection.createIndex(desired.dueDate.key, desired.dueDate.options);
  await collection.createIndex(desired.taskOwner.key, desired.taskOwner.options);
  console.log('✅ Ensured secondary indexes');
}

// ======================= MAIN SEED ===========================
async function seedCalendarTasks() {
  const client = new MongoClient(MONGODB_URI, { maxPoolSize: 5 });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('calendar_tasks');

    if (ALLOW_PURGE) {
      await collection.deleteMany({});
      console.log('🧹 Cleared existing calendar tasks');
    } else {
      console.log('⚠️ Skipped purge (ALLOW_PURGE=false)');
    }

    // Insert documents
    const result = await collection.insertMany(calendarTasks, { ordered: true });
    console.log(`📥 Inserted ${result.insertedCount} calendar tasks`);

    // Ensure indexes (with conflict repair if enabled)
    await ensureIndexes(collection);

    console.log('🧱 Indexes verified');
    console.log('✅ Calendar tasks seeding completed successfully!');
  } catch (error) {
    console.error('💥 Error seeding calendar tasks:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// ======================== RUN ================================
seedCalendarTasks()
  .then(() => {
    console.log('🏁 Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
