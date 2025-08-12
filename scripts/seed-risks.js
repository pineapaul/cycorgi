
/**
 * Seed 50 realistic risks into MongoDB for the GRC Platform.
 * 
 * Usage:
 *   1) Ensure you have Node 18+ and npm installed.
 *   2) Install the MongoDB driver (once):   npm i mongodb@6
 *   3) Create .env.local file with your MongoDB connection string:
 *        MONGODB_URI="mongodb+srv://<user>:<pass>@<host>/<db>?retryWrites=true&w=majority"
 *   4) (Optional) override DB and collection:
 *        export DB_NAME="grc_platform"
 *        export COLLECTION_NAME="risks"
 *   5) Run:
 *        node seed-risks.js
 *
 * Safety notes:
 * - The script clears the target collection first (deleteMany({})).
 * - It does not log credentials and will abort if MONGODB_URI is missing.
 * - Annex A control references use ISO/IEC 27001:2022 style IDs (e.g., A.5.9, A.8.18).
 */

const { MongoClient } = require("mongodb");
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!key.startsWith('#')) {
          envVars[key.trim()] = value.replace(/^[\"'""'']|[\"'""'']$/g, ''); // Remove quotes
        }
      }
    });

    // Set environment variables
    Object.keys(envVars).forEach(key => {
      process.env[key] = envVars[key];
    });
  }
}

// Load environment variables
loadEnvFile();

// Check if .env.local exists and provide helpful error message
if (!fs.existsSync(path.join(__dirname, '..', '.env.local'))) {
  console.error("❌ .env.local file not found in project root");
  console.error("Please create .env.local file with your MongoDB connection string:");
  console.error("MONGODB_URI=mongodb+srv://<user>:<pass>@<host>/<db>?retryWrites=true&w=majority");
  process.exit(1);
}

// Constants aligned with lib/constants.ts
const RISK_PHASES = {
  DRAFT: 'Draft',
  IDENTIFICATION: 'Identification',
  ANALYSIS: 'Analysis',
  EVALUATION: 'Evaluation',
  TREATMENT: 'Treatment',
  MONITORING: 'Monitoring',
  CLOSED: 'Closed'
};

const RISK_ACTIONS = {
  AVOID: 'Avoid',
  TRANSFER: 'Transfer',
  ACCEPT: 'Accept',
  MITIGATE: 'Mitigate'
};

const RISK_RATINGS = {
  EXTREME: 'Extreme',
  HIGH: 'High',
  MODERATE: 'Moderate',
  LOW: 'Low'
};

const CONSEQUENCE_RATINGS = {
  INSIGNIFICANT: 'Insignificant',
  MINOR: 'Minor',
  MODERATE: 'Moderate',
  MAJOR: 'Major',
  CRITICAL: 'Critical'
};

const LIKELIHOOD_RATINGS = {
  RARE: 'Rare',
  UNLIKELY: 'Unlikely',
  POSSIBLE: 'Possible',
  LIKELY: 'Likely',
  ALMOST_CERTAIN: 'Almost Certain'
};

const IMPACT_CIA = {
  CONFIDENTIALITY: 'Confidentiality',
  INTEGRITY: 'Integrity',
  AVAILABILITY: 'Availability'
};

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI env var. Aborting.");
  console.error("Please ensure your .env.local file contains: MONGODB_URI=your_mongodb_connection_string");
  process.exit(1);
}

const DB_NAME = process.env.DB_NAME || (new URL(uri).pathname?.slice(1) || "grc_platform");
const COLLECTION_NAME = process.env.COLLECTION_NAME || "risks";

// --- Domain data to keep entries realistic ---
const functionalUnits = [
  "IT Operations","Network Management Systems","Software Development","Systems Engineering",
  "Corporate IT","Data & Analytics","Privacy Compliance","Applications Support",
  "Security (GRC)","Business Support","Customer Success","Commercial (Sales)"
];

const infoAssetCatalog = [
  "Source Code Repository","Customer PII Database","Billing Platform","Network Edge Routers",
  "Identity Provider (IdP)","SIEM Platform","Endpoint Fleet","Corporate Email",
  "Data Warehouse (EDP)","Cloud Storage Buckets","CI/CD Pipeline","HRIS",
  "Finance GL","Contracts Repository","API Gateway","DNS Management","Certificate Authority",
  "Backups & Snapshots","Asset Inventory","VPN Concentrators","Build Artifacts Registry",
  "Vulnerability Scanner","Ticketing System","Laptop Fleet","SSO Configurations","Mobile App",
  "Web Frontend","Payment Processor","CRM (HubSpot)","Data Modelling Sandbox"
];

const riskActions = Object.values(RISK_ACTIONS);
const phases = [RISK_PHASES.IDENTIFICATION, RISK_PHASES.ANALYSIS, RISK_PHASES.EVALUATION, RISK_PHASES.TREATMENT, RISK_PHASES.MONITORING];
const likelihoods = Object.values(LIKELIHOOD_RATINGS);
const consequences = Object.values(CONSEQUENCE_RATINGS);
const impactsAll = Object.values(IMPACT_CIA);

// ISO/IEC 27001:2022 Annex A control IDs (truncated notation "A.x.y").
const isoControls = ['A.5.1', 'A.5.2', 'A.5.3', 'A.5.4', 'A.5.5', 'A.5.6', 'A.5.7', 'A.5.8', 'A.5.9', 'A.5.10', 'A.5.11', 'A.5.12', 'A.5.13', 'A.5.14', 'A.5.15', 'A.5.16', 'A.5.17', 'A.5.18', 'A.5.19', 'A.5.20', 'A.5.21', 'A.5.22', 'A.5.23', 'A.5.24', 'A.5.25', 'A.5.26', 'A.5.27', 'A.5.28', 'A.5.29', 'A.5.30', 'A.5.31', 'A.5.32', 'A.5.33', 'A.5.34', 'A.5.35', 'A.5.36', 'A.5.37', 'A.6.1', 'A.6.2', 'A.6.3', 'A.6.4', 'A.6.5', 'A.6.6', 'A.6.7', 'A.6.8', 'A.7.1', 'A.7.2', 'A.7.3', 'A.7.4', 'A.7.5', 'A.7.6', 'A.7.7', 'A.7.8', 'A.7.9', 'A.7.10', 'A.7.11', 'A.7.12', 'A.7.13', 'A.7.14', 'A.8.1', 'A.8.2', 'A.8.3', 'A.8.4', 'A.8.5', 'A.8.6', 'A.8.7', 'A.8.8', 'A.8.9', 'A.8.10', 'A.8.11', 'A.8.12', 'A.8.13', 'A.8.14', 'A.8.15', 'A.8.16', 'A.8.17', 'A.8.18', 'A.8.19', 'A.8.20', 'A.8.21', 'A.8.22', 'A.8.23', 'A.8.24', 'A.8.25', 'A.8.26', 'A.8.27', 'A.8.28', 'A.8.29', 'A.8.30', 'A.8.31', 'A.8.32', 'A.8.33', 'A.8.34'];

function pick(arr, n=1) {
  const copy = [...arr];
  const out = [];
  while (n-- > 0 && copy.length) {
    const i = Math.floor(Math.random()*copy.length);
    out.push(copy.splice(i,1)[0]);
  }
  return out;
}

function sample(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

/**
 * Calculate risk rating based on likelihood and consequence using the same matrix
 * as defined in the RiskMatrix component.
 * 
 * Matrix structure (5x5):
 * - Rows: Likelihood (Rare, Unlikely, Possible, Likely, Almost Certain)
 * - Columns: Consequence (Insignificant, Minor, Moderate, Major, Critical)
 * 
 * This ensures consistency with the application's risk assessment methodology.
 */
function riskMatrix(consequence, likelihood) {
  const lIdx = likelihoods.indexOf(likelihood); // 0..4
  const cIdx = consequences.indexOf(consequence); // 0..4
  
  // Use the same matrix as defined in RiskMatrix component
  const riskMatrix = [
    [RISK_RATINGS.LOW, RISK_RATINGS.LOW, RISK_RATINGS.MODERATE, RISK_RATINGS.HIGH, RISK_RATINGS.HIGH],           // Rare
    [RISK_RATINGS.LOW, RISK_RATINGS.LOW, RISK_RATINGS.MODERATE, RISK_RATINGS.HIGH, RISK_RATINGS.EXTREME],         // Unlikely  
    [RISK_RATINGS.LOW, RISK_RATINGS.MODERATE, RISK_RATINGS.HIGH, RISK_RATINGS.EXTREME, RISK_RATINGS.EXTREME],     // Possible
    [RISK_RATINGS.MODERATE, RISK_RATINGS.MODERATE, RISK_RATINGS.HIGH, RISK_RATINGS.EXTREME, RISK_RATINGS.EXTREME], // Likely
    [RISK_RATINGS.MODERATE, RISK_RATINGS.HIGH, RISK_RATINGS.EXTREME, RISK_RATINGS.EXTREME, RISK_RATINGS.EXTREME],  // Almost Certain
  ];
  
  return riskMatrix[lIdx][cIdx];
}

// Some realistic risk templates
const riskTemplates = [
  {
    threat: "Credential stuffing and brute force against public login endpoints",
    vulnerability: "Weak password hygiene; missing MFA for some accounts; insufficient rate limiting",
    statement: "Risk of account takeover leading to unauthorised access to sensitive systems and data."
  },
  {
    threat: "Phishing and business email compromise (BEC) targeting executives and finance staff",
    vulnerability: "Inadequate user awareness; weak mail authentication (SPF/DKIM/DMARC) enforcement",
    statement: "Risk of fraudulent payments, data leakage, and regulatory non-compliance."
  },
  {
    threat: "Ransomware delivered via endpoint exploits or email",
    vulnerability: "Unpatched endpoints; permissive macro settings; insufficient EDR coverage",
    statement: "Risk of data encryption, service disruption, and costly recovery efforts."
  },
  {
    threat: "Cloud misconfiguration exposing storage buckets or databases",
    vulnerability: "Public read ACLs; missing network restrictions; weak IAM policies",
    statement: "Risk of unauthorised data access and breach notification obligations."
  },
  {
    threat: "Insider misuse of privileged access",
    vulnerability: "Inadequate segregation of duties; stale privileged accounts; insufficient monitoring",
    statement: "Risk of data tampering, exfiltration, and reputational damage."
  },
  {
    threat: "Third-party/SaaS breach impacting integrated systems",
    vulnerability: "Weak supplier due diligence; inadequate contract clauses; token over-privilege",
    statement: "Risk of downstream compromise and data leakage through supplier systems."
  },
  {
    threat: "DDoS against customer-facing services",
    vulnerability: "Limited autoscaling; missing upstream protection; inadequate runbooks",
    statement: "Risk of service unavailability and SLA penalties."
  },
  {
    threat: "API key or token leakage via public repos or logs",
    vulnerability: "Secrets in code; insufficient scanning; permissive token scopes",
    statement: "Risk of unauthorised API access and data exfiltration."
  },
  {
    threat: "Delayed patching of internet-facing services",
    vulnerability: "Manual processes; lack of maintenance windows; insufficient vulnerability SLAs",
    statement: "Risk of exploitation of known vulnerabilities leading to compromise."
  },
  {
    threat: "Data residency and cross-border transfer non-compliance",
    vulnerability: "Ambiguous data maps; lack of SCCs; misconfigured storage regions",
    statement: "Risk of regulatory penalties and forced service changes."
  },
  {
    threat: "Compromise of CI/CD pipeline",
    vulnerability: "Weak runner isolation; unsigned artifacts; permissive repo permissions",
    statement: "Risk of supply chain compromise and malicious code deployment."
  },
  {
    threat: "Loss of backups or inability to restore",
    vulnerability: "Incomplete backup coverage; untested restores; single-region storage",
    statement: "Risk of prolonged data loss and recovery failure."
  },
  {
    threat: "Privilege escalation via misconfigured IAM",
    vulnerability: "Overly broad roles; missing least privilege; lack of periodic reviews",
    statement: "Risk of lateral movement and full environment compromise."
  },
  {
    threat: "Unencrypted sensitive data at rest or in transit",
    vulnerability: "Legacy services; misconfigured TLS; missing key rotation",
    statement: "Risk of data disclosure and non-compliance with contractual requirements."
  },
  {
    threat: "Physical theft or loss of end-user devices",
    vulnerability: "Missing disk encryption; weak MDM controls",
    statement: "Risk of exposure of cached credentials and local data."
  },
  {
    threat: "Weak application input validation (OWASP Top 10)",
    vulnerability: "Insufficient secure coding practices; lack of security testing",
    statement: "Risk of injection, XSS, and data integrity compromise."
  },
  {
    threat: "Inadequate logging and monitoring of critical systems",
    vulnerability: "Sparse telemetry; log retention gaps; no alerting on key events",
    statement: "Risk of delayed detection and response to security incidents."
  },
  {
    threat: "Shadow IT and unsanctioned SaaS usage",
    vulnerability: "Lack of asset inventory; inadequate DLP controls",
    statement: "Risk of uncontrolled data flows and compliance violations."
  },
  {
    threat: "Configuration drift and insecure defaults",
    vulnerability: "Manual provisioning; missing baselines; weak change control",
    statement: "Risk of inconsistent security posture and unexpected exposures."
  }
];

const owners = [
  "Chief Technology Officer","Information Security GRC Manager","VP of Engineering",
  "Head of Corporate IT","Data & Analytics Lead","Privacy Officer",
  "Network Operations Manager","Applications Support Manager","Product Engineering Director"
];

const countries = ["Australia","Singapore","Hong Kong","United Kingdom","Belgium","United States","Greece","Germany","Japan","Philippines"];

function randomDateBetween(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return new Date(s + Math.random()*(e - s));
}

function makeRisk(i) {
  const id = String(i).padStart(3, "0");
  const fu = sample(functionalUnits);
  const assets = pick(infoAssetCatalog, Math.ceil(1+Math.random()*3)); // 2-4 assets
  const assetIds = pick([...Array(40).keys()].map(n=>String(n+1)), Math.ceil(1+Math.random()*3));
  const tmpl = sample(riskTemplates);
  const likelihood = sample(likelihoods);
  const consequence = sample(consequences);
  const rating = riskMatrix(consequence, likelihood);
  const currentControls = pick([
    "MFA enforced",
    "Quarterly access reviews",
    "Network segmentation",
    "EDR with behavioural detection",
    "WAF in front of APIs",
    "S3/Bucket public access blocks",
    "Automated patching windows",
    "Immutable backups (air-gapped)",
    "SSO via IdP with conditional access",
    "Vulnerability scanning (weekly)",
    "DLP policies for email and cloud",
    "TLS 1.2+ everywhere; cert automation",
    "SIEM correlation with 12-month retention",
    "Change management with approvals",
    "Secure baseline images (CIS)"
  ], Math.ceil(2+Math.random()*3));
  const ctrlRefs = pick(isoControls, Math.ceil(3+Math.random()*5));
  const action = sample(riskActions);
  const phase = sample(phases);

  // Dates around June-Aug 2025 (adjust as needed)
  const raised = randomDateBetween("2025-06-01", "2025-08-06");
  const ssc = new Date(raised.getTime() + 1000*60*60*24* (2 + Math.floor(Math.random()*14)));
  const treatmentsApproved = new Date(ssc.getTime() + 1000*60*60*24* (1 + Math.floor(Math.random()*10)));
  const treatmentsAssigned = new Date(ssc.getTime() - 1000*60*60*24* (1 + Math.floor(Math.random()*5)));
  const treatmentCompleted = new Date(treatmentsApproved.getTime() + 1000*60*60*24* (7 + Math.floor(Math.random()*21)));
  const updatedAt = randomDateBetween(treatmentCompleted, "2025-08-12T10:00:00Z");
  const createdAt = new Date(raised);

  // Residuals: often reduced from initial (typically lower than initial risk)
  const residualLikelihood = sample([LIKELIHOOD_RATINGS.RARE, LIKELIHOOD_RATINGS.UNLIKELY, LIKELIHOOD_RATINGS.POSSIBLE]);
  const residualConsequence = sample([CONSEQUENCE_RATINGS.INSIGNIFICANT, CONSEQUENCE_RATINGS.MINOR, CONSEQUENCE_RATINGS.MODERATE]);
  const residualRiskRating = riskMatrix(residualConsequence, residualLikelihood);

  const impact = pick(impactsAll, 1 + Math.floor(Math.random()*3));

  return {
    riskId: `RISK-${id}`,
    functionalUnit: fu,
    informationAsset: assetIds,
    riskStatement: tmpl.statement,
    riskRating: rating,
    consequenceRating: consequence,
    likelihoodRating: likelihood,
    impact,
    riskOwner: sample(owners),
    threat: tmpl.threat,
    vulnerability: tmpl.vulnerability,
    currentControls,
    currentPhase: phase,
    reasonForAcceptance: action === RISK_ACTIONS.ACCEPT ? "Residual risk within appetite for time-bound business needs." : "N/A",
    dateOfSSCApproval: ssc.toISOString().slice(0,10),
    dateRiskTreatmentsApproved: treatmentsApproved.toISOString().slice(0,10),
    residualConsequence: residualConsequence,
    residualLikelihood: residualLikelihood,
    residualRiskRating: residualRiskRating,
    residualRiskAcceptedByOwner: sample(owners),
    dateResidualRiskAccepted: action === RISK_ACTIONS.ACCEPT ? new Date(treatmentCompleted.getTime() + 1000*60*60*24*2).toISOString().slice(0,10) : null,
    dateRiskTreatmentCompleted: treatmentCompleted,
    dateRiskTreatmentsAssigned: treatmentsAssigned,
    applicableControlsAfterTreatment: pick([
      "Enhanced access controls and MFA",
      "Continuous monitoring and alerting",
      "Automated backups with restore testing",
      "Hardened configurations and baseline enforcement",
      "Supplier oversight and contractual clauses",
      "Network micro-segmentation and zero trust principles"
    ], 1).join(", "),
    createdAt,
    updatedAt,
    affectedSites: sample(countries),
    consequence: consequence,
    currentControlsReference: ctrlRefs,
    currentRiskRating: rating,
    dateRiskRaised: raised.toISOString().slice(0,10),
    informationAssets: assets.join(", "),
    jiraTicket: `RISK-${id}`,
    likelihood: likelihood,
    raisedBy: sample(owners),
    riskAction: action,
    treatmentCount: 1 + Math.floor(Math.random()*5)
  };
}

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION_NAME);

    console.log(`Connected. Target => db=${DB_NAME}, collection=${COLLECTION_NAME}`);
    console.log("Clearing existing data...");
    await col.deleteMany({});

    const risks = Array.from({length: 50}, (_, idx) => makeRisk(idx+1));

    console.log("Inserting 50 risks...");
    await col.insertMany(risks, { ordered: true });

    console.log("✅ Done. Inserted 50 risk records.");
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
