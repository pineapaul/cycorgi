require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

/**
 * Complete SOA Setup Script (ISO/IEC 27001:2022)
 * - Updates titles/descriptions for all 93 Annex A controls (paraphrased).
 * - Keeps schema identical to existing soa_controls collection.
 * - Migrates legacy fields; converts justification to array; replaces "Planned" -> "Planning Implementation".
 * - Drops and recreates the unique index on id as "id_unique" to avoid conflicts.
 */

const CONTROL_JUSTIFICATION = {
  BEST_PRACTICE: 'Best Practice',
  LEGAL_REQUIREMENT: 'Legal Requirement',
  REGULATORY_REQUIREMENT: 'Regulatory Requirement',
  BUSINESS_REQUIREMENT: 'Business Requirement',
  RISK_MANAGEMENT_REQUIREMENT: 'Risk Management Requirement'
};

// Utilities
function getRandomElements(array, min, max) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

function getRandomRelatedRisksCount() {
  return Math.floor(Math.random() * 4) + 3; // 3-6
}

// ISO/IEC 27001:2022 Annex A controls (paraphrased descriptions)
const iso27001Controls = [
  {
    id: 'A.5',
    title: 'Organisational Controls',
    description: 'Policies, supplier management, incident readiness, and governance-oriented controls.',
    controls: [
      {
        id: 'A.5.1',
        title: 'Policies for information security',
        description: 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.2',
        title: 'Information security roles and responsibilities',
        description: 'Information security roles and responsibilities shall be defined and allocated according to the organization needs.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.3',
        title: 'Segregation of duties',
        description: 'Conflicting duties and conflicting areas of responsibility shall be segregated.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.4',
        title: 'Management responsibilities',
        description: 'Management shall require all personnel to apply information security in accordance with the established information security policy, topic-specific policies and procedures of the organization.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.5',
        title: 'Contact with authorities',
        description: 'The organization shall establish and maintain contact with relevant authorities.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.6',
        title: 'Contact with special interest groups',
        description: 'Maintain contact with industry groups and professional associations.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.7',
        title: 'Threat intelligence',
        description: 'Collect and analyze threat information to produce intelligence.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.8',
        title: 'Information security in project management',
        description: 'Integrate security activities into project management.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.9',
        title: 'Inventory of information and other associated assets',
        description: 'Maintain an inventory of information and associated assets with owners.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.10',
        title: 'Acceptable use of information and other associated assets',
        description: 'Define and enforce acceptable use and handling of assets.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.11',
        title: 'Return of assets',
        description: 'Ensure Organisational assets are returned on exit or change.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.12',
        title: 'Classification of information',
        description: 'Classify information based on confidentiality, integrity, availability, and stakeholder needs.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.13',
        title: 'Labelling of information',
        description: 'Establish and apply information labeling procedures aligned to classification.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.14',
        title: 'Information transfer',
        description: 'Establish rules or agreements for secure information transfer.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.15',
        title: 'Access control',
        description: 'Establish and implement rules for logical and physical access control.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.16',
        title: 'Identity management',
        description: 'Manage the full identity life cycle.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.17',
        title: 'Authentication information',
        description: 'Control the allocation and management of authentication information.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.18',
        title: 'Access rights',
        description: 'Provision, review, modify and revoke access rights as required.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.19',
        title: 'Information security in supplier relationships',
        description: 'Manage risks from suppliers products and services.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.20',
        title: 'Addressing information security within supplier agreements',
        description: 'Define and agree relevant security requirements in supplier agreements.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.21',
        title: 'Managing information security in the ICT supply chain',
        description: 'Manage ICT supply chain security risks.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.22',
        title: 'Monitoring, review and change management of supplier services',
        description: 'Monitor and review supplier security and manage changes.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.23',
        title: 'Information security for use of cloud services',
        description: 'Define processes to acquire, use, manage and exit cloud services securely.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.24',
        title: 'Information security incident management planning and preparation',
        description: 'Plan and prepare for incident management: processes, roles and responsibilities.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.25',
        title: 'Assessment and decision on information security events',
        description: 'Assess security events and decide whether they are incidents.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.26',
        title: 'Response to information security incidents',
        description: 'Respond to incidents following documented procedures.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.27',
        title: 'Learning from information security incidents',
        description: 'Use lessons from incidents to strengthen controls.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.28',
        title: 'Collection of evidence',
        description: 'Establish procedures to identify, collect and preserve evidence.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.29',
        title: 'Information security during disruption',
        description: 'Plan for maintaining appropriate security during disruptions.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.30',
        title: 'ICT readiness for business continuity',
        description: 'Plan, implement, maintain and test ICT continuity to meet objectives.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.31',
        title: 'Legal, statutory, regulatory and contractual requirements',
        description: 'Identify, document and keep up to date applicable legal, regulatory and contractual requirements.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.32',
        title: 'Intellectual property rights',
        description: 'Protect intellectual property rights appropriately.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.33',
        title: 'Protection of records',
        description: 'Protect records against loss, alteration, unauthorized access or release.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.34',
        title: 'Privacy and protection of PII',
        description: 'Meet privacy and personal data protection requirements.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.35',
        title: 'Independent review of information security',
        description: 'Independently review the security program at planned intervals or after major changes.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.36',
        title: 'Compliance with policies, rules and standards for information security',
        description: 'Regularly review compliance with internal policies, rules and standards.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.5.37',
        title: 'Documented operating procedures',
        description: 'Document operating procedures for information processing facilities.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      }
    ]
  },
  {
    id: 'A.6',
    title: 'People Controls',
    description: 'Human resources and personnel security controls.',
    controls: [
      {
        id: 'A.6.1',
        title: 'Screening',
        description: 'Perform proportional background checks before joining and as appropriate.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.6.2',
        title: 'Terms and conditions of employment',
        description: 'State security responsibilities in employment agreements.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.6.3',
        title: 'Information security awareness, education and training',
        description: 'Provide appropriate awareness and training with regular updates.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.6.4',
        title: 'Disciplinary process',
        description: 'Formalize and communicate actions for policy violations.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.6.5',
        title: 'Responsibilities after termination or change of employment',
        description: 'Define and enforce post-employment responsibilities.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.6.6',
        title: 'Confidentiality or non-disclosure agreements',
        description: 'Use and review NDAs reflecting protection needs.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.6.7',
        title: 'Remote working',
        description: 'Implement measures to protect information when working remotely.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.6.8',
        title: 'Information security event reporting',
        description: 'Provide timely reporting channels for security events.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      }
    ]
  },
  {
    id: 'A.7',
    title: 'Physical Controls',
    description: 'Facility and environmental protection controls.',
    controls: [
      {
        id: 'A.7.1',
        title: 'Physical security perimeters',
        description: 'Define and use security perimeters to protect areas with assets.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.2',
        title: 'Physical entry',
        description: 'Protect secure areas with appropriate entry controls and access points.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.3',
        title: 'Securing offices, rooms and facilities',
        description: 'Design and implement physical security for offices and facilities.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.4',
        title: 'Physical security monitoring',
        description: 'Continuously monitor premises for unauthorized physical access.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.5',
        title: 'Protecting against physical and environmental threats',
        description: 'Design and implement protection against physical and environmental threats.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.6',
        title: 'Working in secure areas',
        description: 'Design and implement measures for work conducted in secure areas.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.7',
        title: 'Clear desk and clear screen',
        description: 'Enforce clear desk and clear screen practices.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.8',
        title: 'Equipment siting and protection',
        description: 'Site and protect equipment appropriately.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.9',
        title: 'Security of assets off-premises',
        description: 'Protect off-site assets.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.10',
        title: 'Storage media',
        description: 'Manage storage media throughout its life cycle per classification and handling rules.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.11',
        title: 'Supporting utilities',
        description: 'Protect processing facilities from utility failures and disruptions.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.12',
        title: 'Cabling security',
        description: 'Protect power/data cabling from interception, interference and damage.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.13',
        title: 'Equipment maintenance',
        description: 'Maintain equipment to ensure availability, integrity and confidentiality.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.7.14',
        title: 'Secure disposal or re-use of equipment',
        description: 'Verify removal or secure overwrite of data/software before disposal or re-use.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      }
    ]
  },
  {
    id: 'A.8',
    title: 'Technological Controls',
    description: 'Technical controls for systems, networks, and applications.',
    controls: [
      {
        id: 'A.8.1',
        title: 'User end point devices',
        description: 'Protect information stored on or accessible from user devices.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.2',
        title: 'Privileged access rights',
        description: 'Restrict and manage privileged access rights.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.3',
        title: 'Information access restriction',
        description: 'Restrict access per access control policy.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.4',
        title: 'Access to source code',
        description: 'Properly manage read/write access to source code and tools.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.5',
        title: 'Secure authentication',
        description: 'Implement secure authentication aligned to access restrictions.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.6',
        title: 'Capacity management',
        description: 'Monitor and adjust resource use to meet capacity needs.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.7',
        title: 'Protection against malware',
        description: 'Implement malware protection and user awareness.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.8',
        title: 'Management of technical vulnerabilities',
        description: 'Obtain vulnerability information, assess exposure and take action.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.9',
        title: 'Configuration management',
        description: 'Establish, document, implement, monitor and review configurations.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.10',
        title: 'Information deletion',
        description: 'Delete information when it is no longer required.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.11',
        title: 'Data masking',
        description: 'Use data masking as appropriate and lawful.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.12',
        title: 'Data leakage prevention',
        description: 'Apply measures to prevent data leakage.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.13',
        title: 'Information backup',
        description: 'Maintain and regularly test backups per policy.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.14',
        title: 'Redundancy of information processing facilities',
        description: 'Implement redundancy to meet availability requirements.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.15',
        title: 'Logging',
        description: 'Produce, store, protect and analyze logs.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.16',
        title: 'Monitoring activities',
        description: 'Monitor networks, systems and apps for anomalies and act as needed.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.17',
        title: 'Clock synchronization',
        description: 'Synchronize system clocks to approved time sources.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.18',
        title: 'Use of privileged utility programs',
        description: 'Restrict and tightly control powerful utility programs.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.19',
        title: 'Installation of software on operational systems',
        description: 'Securely manage software installation on live systems.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.20',
        title: 'Networks security',
        description: 'Secure, manage and control networks and devices.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.21',
        title: 'Security of network services',
        description: 'Identify, implement and monitor security for network services.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.22',
        title: 'Segregation of networks',
        description: 'Separate groups/services/systems on networks as needed.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.23',
        title: 'Web filtering',
        description: 'Manage access to external websites to reduce malicious exposure.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.24',
        title: 'Use of cryptography',
        description: 'Define and implement rules for cryptography and key management.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.25',
        title: 'Secure development life cycle',
        description: 'Define and apply rules for secure development.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.26',
        title: 'Application security requirements',
        description: 'Identify and approve security requirements for applications.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.27',
        title: 'Secure system architecture and engineering principles',
        description: 'Define and apply secure system architecture and engineering principles.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.28',
        title: 'Secure coding',
        description: 'Apply secure coding practices.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.29',
        title: 'Security testing in development and acceptance',
        description: 'Define and implement security testing in the lifecycle.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.30',
        title: 'Outsourced development',
        description: 'Direct, monitor and review outsourced development.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.31',
        title: 'Separation of development, test and production environments',
        description: 'Separate and secure dev, test and production environments.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.32',
        title: 'Change management',
        description: 'Apply change management to systems and facilities.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.33',
        title: 'Test information',
        description: 'Select, protect and manage test data appropriately.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      },
      {
        id: 'A.8.34',
        title: 'Protection of information systems during audit testing',
        description: 'Plan and agree scope to protect live systems during audit/testing.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        relatedRisks: [],
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: ''
      }
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
    if (!uri) throw new Error('MONGODB_URI environment variable is not set');
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
    console.log('\n🔄 Migrating existing SOA controls...');
    const existing = await this.collection.find({}).toArray();
    if (existing.length === 0) {
      console.log('📝 No existing controls found - will proceed with fresh seeding');
      return;
    }
    const ops = [];
    for (const c of existing) {
      const set = {
        updatedAt: new Date().toISOString()
      };
      let unset = null;
      let needs = false;

      // Rename status -> controlStatus
      if (c.status && !c.controlStatus) {
        set.controlStatus = c.status;
        unset = { ...(unset||{}), status: "" };
        needs = true;
      }

      // Normalize "Planned" -> "Planning Implementation"
      const s = set.controlStatus || c.controlStatus;
      if (s === 'Planned') {
        set.controlStatus = 'Planning Implementation';
        needs = true;
      }

      if (!c.controlApplicability) {
        set.controlApplicability = 'Applicable';
        needs = true;
      }
      if (!Array.isArray(c.relatedRisks)) {
        set.relatedRisks = [];
        needs = true;
      }

      // justification -> array of enums
      if (c.justification) {
        const arr = Array.isArray(c.justification) ? c.justification : [c.justification];
        const map = (j) => this.mapOldJustificationToNew(j);
        set.justification = arr.map(map);
        needs = true;
      } else {
        set.justification = [CONTROL_JUSTIFICATION.BEST_PRACTICE];
        needs = true;
      }

      if (needs) {
        ops.push({
          updateOne: {
            filter: { _id: c._id },
            update: unset ? { $set: set, $unset: unset } : { $set: set }
          }
        });
      }
    }
    if (ops.length) {
      const res = await this.collection.bulkWrite(ops);
      console.log(`✅ Migrated ${res.modifiedCount} controls`);
    } else {
      console.log('✅ No migration changes required');
    }
  }

  mapOldJustificationToNew(oldJ) {
    const m = {
      'Best Practice': CONTROL_JUSTIFICATION.BEST_PRACTICE,
      'Legal Requirement': CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT,
      'Regulatory Requirement': CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT,
      'Business Requirement': CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT,
      'Risk Management Requirement': CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT
    };
    return m[oldJ] || CONTROL_JUSTIFICATION.BEST_PRACTICE;
  }

  async updateIndexes() {
    console.log('🔧 Updating database indexes...');
    try {
      // Drop old/legacy indexes if present
      try { await this.collection.dropIndex('status_1'); } catch (e) {/* ignore */}
      try { await this.collection.dropIndex('id_1'); } catch (e) {/* ignore */}
      try { await this.collection.dropIndex('id_unique'); } catch (e) {/* ignore */}

      await this.collection.createIndex({ controlStatus: 1 });
      await this.collection.createIndex({ controlApplicability: 1 });
      await this.collection.createIndex({ justification: 1 });
      await this.collection.createIndex({ relatedRisks: 1 });
      await this.collection.createIndex({ id: 1 }, { unique: true, name: 'id_unique' });
      console.log('✅ Indexes updated (unique on id as "id_unique")');
    } catch (err) {
      console.error('⚠️  Index update warning:', err.message);
    }
  }

  async fetchExistingRisks() {
    try {
      const risks = await this.db.collection('risks').find({}, { projection: { riskId: 1 } }).toArray();
      return risks.map(r => r.riskId).filter(Boolean);
    } catch (e) {
      console.log('⚠️  Could not fetch risks:', e.message);
      return [];
    }
  }

  async seedControls() {
    console.log('\n🌱 Seeding SOA controls...');
    await this.collection.deleteMany({});
    console.log('🗑️  Cleared existing SoA controls');

    const riskIds = await this.fetchExistingRisks();

    const docs = [];
    for (const set of iso27001Controls) {
      for (const c of set.controls) {
        // Ensure no legacy "Planned"
        const status = c.controlStatus === 'Planned' ? 'Planning Implementation' : c.controlStatus;

        const doc = {
          ...c,
          controlStatus: status,
          controlSetId: set.id,
          controlSetTitle: set.title,
          controlSetDescription: set.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        if (riskIds.length > 0) {
          doc.relatedRisks = getRandomElements(riskIds, 3, Math.min(6, riskIds.length));
        }
        docs.push(doc);
      }
    }

    const res = await this.collection.insertMany(docs);
    console.log(`✅ Seeded ${res.insertedCount} controls`);

    await this.updateIndexes();
    await this.showSample();
  }

  async showSample() {
    const sample = await this.collection.find({}).limit(5).toArray();
    console.log('\n📋 Sample:');
    for (let i = 0; i < sample.length; i++) {
      const c = sample[i];
      console.log(`  ${i+1}. ${c.id} - ${c.title} [${c.controlStatus}] (justifications: ${Array.isArray(c.justification)?c.justification.join(', '):c.justification})`);
    }
  }

  async run() {
    try {
      await this.connect();
      await this.migrateExistingControls();
      await this.seedControls();
      console.log('\n🎉 SOA setup completed successfully');
    } catch (e) {
      console.error('\n💥 SOA setup failed:', e);
      throw e;
    } finally {
      await this.disconnect();
    }
  }
}

if (require.main === module) {
  const setupManager = new SoASetupManager();
  setupManager.run().catch(console.error);
}

module.exports = { SoASetupManager, CONTROL_JUSTIFICATION };
