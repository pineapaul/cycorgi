require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

/**
 * Comprehensive ISO 27001:2022 SOA Controls Seeding Script
 * 
 * Seeds all 93 controls from ISO 27001:2022 Annex A with:
 * - Proper control categorization (Organizational, People, Physical, Technological)
 * - Multiple justifications per control (array-based)
 * - Realistic implementation status and applicability
 * - Related risks linking (3-6 risks per control)
 * - Implementation notes and guidance
 */

// CONTROL_JUSTIFICATION constants
const CONTROL_JUSTIFICATION = {
  BEST_PRACTICE: 'Best Practice',
  LEGAL_REQUIREMENT: 'Legal Requirement',
  REGULATORY_REQUIREMENT: 'Regulatory Requirement',
  BUSINESS_REQUIREMENT: 'Business Requirement',
  RISK_MANAGEMENT_REQUIREMENT: 'Risk Management Requirement'
};

// Helper functions
function getRandomElements(array, min, max) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomRelatedRisksCount() {
  return Math.floor(Math.random() * 4) + 3; // 3-6 related risks
}

// Complete ISO 27001:2022 Annex A Controls (93 controls)
const iso27001Controls = [
  {
    id: 'A.5',
    title: 'Organisational Controls',
    description: 'Information security policies and organizational security measures',
    controls: [
      {
        id: 'A.5.1',
        title: 'Policies for information security',
        description: 'A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Information security policy framework established with annual review cycle'
      },
      {
        id: 'A.5.2',
        title: 'Information security roles and responsibilities',
        description: 'Information security roles and responsibilities shall be defined and allocated in accordance with the organization needs.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'RACI matrix maintained with clear accountability structure'
      },
      {
        id: 'A.5.3',
        title: 'Segregation of duties',
        description: 'Conflicting duties and areas of responsibility shall be segregated to reduce opportunities for unauthorized or unintentional modification or misuse of the organization assets.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: 'Dual approval processes implemented for critical operations'
      },
      {
        id: 'A.5.4',
        title: 'Management responsibilities',
        description: 'Management shall require all personnel to apply information security in accordance with the established policies and procedures of the organization.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Regular management reviews and security performance monitoring'
      },
      {
        id: 'A.5.5',
        title: 'Contact with authorities',
        description: 'Appropriate contacts with relevant authorities shall be maintained.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT, CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT],
        implementationDetails: 'Contact registry maintained for law enforcement and regulatory bodies'
      },
      {
        id: 'A.5.6',
        title: 'Contact with special interest groups',
        description: 'Appropriate contacts with special interest groups or other specialist security forums and professional associations shall be maintained.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: 'Active participation in cybersecurity forums and threat intelligence sharing'
      },
      {
        id: 'A.5.7',
        title: 'Threat intelligence',
        description: 'Information relating to information security threats shall be collected and analyzed to produce threat intelligence.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: 'Automated threat intelligence feeds integrated with security monitoring'
      },
      {
        id: 'A.5.8',
        title: 'Information security in project management',
        description: 'Information security shall be integrated into project management.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Security requirements integrated into project lifecycle methodology'
      },
      {
        id: 'A.5.9',
        title: 'Inventory of information and other associated assets',
        description: 'An inventory of information and other associated assets, including owners, shall be developed and maintained.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Automated asset discovery and CMDB integration'
      },
      {
        id: 'A.5.10',
        title: 'Acceptable use of information and other associated assets',
        description: 'Rules for the acceptable use of information and other associated assets shall be identified, documented and implemented.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT],
        implementationDetails: 'Acceptable use policy with regular acknowledgment requirements'
      },
      {
        id: 'A.5.11',
        title: 'Return of assets',
        description: 'Personnel and other interested parties shall return all organizational assets in their possession upon termination of their employment, contract or agreement.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Formal asset return process integrated with HR offboarding'
      },
      {
        id: 'A.5.12',
        title: 'Classification of information',
        description: 'Information shall be classified in terms of legal requirements, value, criticality and sensitivity to unauthorized disclosure or modification.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Four-tier classification scheme with automated labeling tools'
      },
      {
        id: 'A.5.13',
        title: 'Labelling of information',
        description: 'An appropriate set of procedures for information labelling shall be developed and implemented in accordance with the information classification scheme adopted by the organization.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Automated labeling system with visual indicators'
      },
      {
        id: 'A.5.14',
        title: 'Information transfer',
        description: 'Information transfer rules, procedures or agreements shall be in place for all types of transfer facilities within the organization and between the organization and other parties.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Secure file transfer protocols and encryption requirements'
      },
      {
        id: 'A.5.15',
        title: 'Access control',
        description: 'Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Role-based access control with least privilege principle'
      },
      {
        id: 'A.5.16',
        title: 'Identity management',
        description: 'The full life cycle of identities shall be managed.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Centralized identity management system with automated provisioning'
      },
      {
        id: 'A.5.17',
        title: 'Authentication information',
        description: 'Allocation and management of authentication information shall be controlled by a management process, including advising personnel on appropriate handling of authentication information.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Password policy enforcement with multi-factor authentication'
      },
      {
        id: 'A.5.18',
        title: 'Access rights',
        description: 'Access rights to information and other associated assets shall be provisioned, reviewed, modified and removed in accordance with the organization access control policy and rules.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Quarterly access reviews with automated workflow'
      },
      {
        id: 'A.5.19',
        title: 'Information security in supplier relationships',
        description: 'Processes and procedures shall be defined and implemented to manage the information security risks associated with the use of supplier products or services.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Supplier security assessment program with ongoing monitoring'
      },
      {
        id: 'A.5.20',
        title: 'Addressing information security within supplier agreements',
        description: 'Relevant information security requirements shall be established and agreed with each supplier that may access, process, store, communicate, or provide IT infrastructure components for, the organization information.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Standard security clauses in all supplier contracts'
      },
      {
        id: 'A.5.21',
        title: 'Managing information security in the ICT supply chain',
        description: 'Processes and procedures shall be defined and implemented to manage the information security risks associated with the ICT products and services supply chain.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Supply chain risk assessment with security requirements validation'
      },
      {
        id: 'A.5.22',
        title: 'Monitoring, review and change management of supplier services',
        description: 'The organization shall regularly monitor, review and audit supplier service delivery.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Quarterly supplier performance reviews with security metrics'
      },
      {
        id: 'A.5.23',
        title: 'Information security for use of cloud services',
        description: 'Processes for acquisition, use, management and exit from cloud services shall be established in accordance with the organization information security requirements.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Cloud security framework with shared responsibility model'
      },
      {
        id: 'A.5.24',
        title: 'Information security incident management planning and preparation',
        description: 'The organization shall plan and prepare for managing information security incidents by defining, establishing and communicating information security incident management processes, roles and responsibilities.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Comprehensive incident response plan with regular tabletop exercises'
      },
      {
        id: 'A.5.25',
        title: 'Assessment and decision on information security events',
        description: 'The organization shall assess information security events and decide if they are to be categorized as information security incidents.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Event correlation system with automated severity assessment'
      },
      {
        id: 'A.5.26',
        title: 'Response to information security incidents',
        description: 'Information security incidents shall be responded to in accordance with the documented procedures.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Incident response team with defined escalation procedures'
      },
      {
        id: 'A.5.27',
        title: 'Learning from information security incidents',
        description: 'Knowledge gained from analyzing and resolving information security incidents shall be used to reduce the likelihood or impact of future incidents.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Post-incident review process with lessons learned documentation'
      },
      {
        id: 'A.5.28',
        title: 'Collection of evidence',
        description: 'The organization shall establish and implement procedures for the identification, collection, acquisition and preservation of information that can serve as evidence.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Digital forensics capability with chain of custody procedures'
      },
      {
        id: 'A.5.29',
        title: 'Information security during disruption',
        description: 'The organization shall plan how to maintain information security at an appropriate level during disruption.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Business continuity plan with security controls integration'
      },
      {
        id: 'A.5.30',
        title: 'ICT readiness for business continuity',
        description: 'ICT readiness shall be planned, implemented, maintained and tested based on business continuity objectives and ICT continuity requirements.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Disaster recovery testing with quarterly validation exercises'
      },
      {
        id: 'A.5.31',
        title: 'Legal, statutory, regulatory and contractual requirements',
        description: 'Legal, statutory, regulatory and contractual requirements relevant to information security and the organization approach to meet these requirements shall be identified, documented and kept up to date.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Legal compliance register with regular updates and monitoring'
      },
      {
        id: 'A.5.32',
        title: 'Intellectual property rights',
        description: 'The organization shall implement appropriate procedures to protect intellectual property rights.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT],
        implementationDetails: 'IP protection policies with software license management'
      },
      {
        id: 'A.5.33',
        title: 'Protection of records',
        description: 'Records shall be protected from loss, destruction, falsification, unauthorized access and unauthorized release.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Records management system with retention schedule compliance'
      },
      {
        id: 'A.5.34',
        title: 'Privacy and protection of personally identifiable information',
        description: 'The organization shall identify and meet the requirements regarding the preservation of privacy and protection of PII according to applicable laws and regulations and contractual requirements.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT, CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT],
        implementationDetails: 'GDPR compliance framework with privacy impact assessments'
      },
      {
        id: 'A.5.35',
        title: 'Independent review of information security',
        description: 'The organization approach to managing information security and its implementation shall be reviewed independently at planned intervals or when significant changes occur.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Annual third-party security assessments and internal audits'
      },
      {
        id: 'A.5.36',
        title: 'Compliance with policies, rules and standards for information security',
        description: 'Compliance with the organization information security policy, topic-specific policies, rules and standards shall be regularly reviewed.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Compliance monitoring with automated policy enforcement'
      },
      {
        id: 'A.5.37',
        title: 'Documented operating procedures',
        description: 'Operating procedures for information processing facilities shall be documented and made available to personnel who need them.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Centralized procedure repository with version control'
      }
    ]
  },
  {
    id: 'A.6',
    title: 'People Controls',
    description: 'Human resource security controls and personnel management',
    controls: [
      {
        id: 'A.6.1',
        title: 'Screening',
        description: 'Background verification checks on all candidates for employment shall be carried out in accordance with relevant laws, regulations and ethics and shall be proportional to the business requirements, the classification of the information to be accessed and the perceived risks.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Multi-level background screening based on access requirements'
      },
      {
        id: 'A.6.2',
        title: 'Terms and conditions of employment',
        description: 'The employment contractual agreements shall state the personnel and the organization responsibilities for information security.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Standard security clauses in employment contracts'
      },
      {
        id: 'A.6.3',
        title: 'Information security awareness, education and training',
        description: 'Personnel of the organization and relevant interested parties shall receive appropriate information security awareness, education and training and regular updates of the organization information security policy, topic-specific policies and procedures.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: 'Comprehensive security awareness program with role-based training'
      },
      {
        id: 'A.6.4',
        title: 'Disciplinary process',
        description: 'A formal and communicated disciplinary process shall be in place to take action against personnel who have committed an information security breach.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Formal disciplinary procedures with progressive enforcement'
      },
      {
        id: 'A.6.5',
        title: 'Responsibilities after termination or change of employment',
        description: 'Information security responsibilities and duties that remain valid after termination or change of employment shall be defined, enforced and communicated to relevant personnel and other interested parties.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Comprehensive offboarding process with security checklist'
      },
      {
        id: 'A.6.6',
        title: 'Confidentiality or non-disclosure agreements',
        description: 'Confidentiality or non-disclosure agreements reflecting the organization needs for the protection of information shall be identified, documented, regularly reviewed and signed by personnel and relevant interested parties.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.LEGAL_REQUIREMENT],
        implementationDetails: 'Standard confidentiality agreements with regular review cycle'
      },
      {
        id: 'A.6.7',
        title: 'Remote working',
        description: 'Security measures shall be implemented when personnel are working remotely to protect information accessed, processed or stored outside the organization premises.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Remote work security policy with VPN and endpoint protection'
      },
      {
        id: 'A.6.8',
        title: 'Information security event reporting',
        description: 'Personnel shall report observed or suspected information security events through appropriate management channels as quickly as possible.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Multiple reporting channels with 24/7 incident hotline'
      }
    ]
  },
  {
    id: 'A.7',
    title: 'Physical and Environmental Security',
    description: 'Protection of physical facilities and equipment',
    controls: [
      {
        id: 'A.7.1',
        title: 'Physical security perimeters',
        description: 'Physical security perimeters shall be defined and used to protect areas that contain either sensitive or critical information and information processing facilities.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Multi-layered perimeter security with access zones'
      },
      {
        id: 'A.7.2',
        title: 'Physical entry',
        description: 'Secure areas shall be protected by appropriate entry controls to ensure that only authorized personnel are allowed access.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Card-based access control with biometric verification for sensitive areas'
      },
      {
        id: 'A.7.3',
        title: 'Protection against environmental threats',
        description: 'Protection against environmental threats such as natural disasters, malicious attack or accidents shall be designed and applied.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Environmental monitoring systems with automated alerts'
      },
      {
        id: 'A.7.4',
        title: 'Working in secure areas',
        description: 'Physical protection and guidelines for working in secure areas shall be designed and applied.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Secure area protocols with escort requirements'
      },
      {
        id: 'A.7.5',
        title: 'Clear desk and clear screen',
        description: 'A clear desk policy for papers and removable storage media and a clear screen policy for information processing facilities shall be adopted.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: 'Clear desk policy with regular compliance checks'
      },
      {
        id: 'A.7.6',
        title: 'Equipment siting and protection',
        description: 'Equipment shall be sited and protected to reduce the risks from environmental threats and hazards, and opportunities for unauthorized access.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Equipment placement guidelines with environmental protection'
      },
      {
        id: 'A.7.7',
        title: 'Secure disposal or reuse of equipment',
        description: 'All items of equipment containing storage media shall be verified to ensure that any sensitive data and licensed software has been removed or securely overwritten prior to disposal or reuse.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Certified data destruction procedures with audit trail'
      },
      {
        id: 'A.7.8',
        title: 'Unattended user equipment',
        description: 'Users shall ensure that unattended equipment has appropriate protection.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Automatic screen lock policies with user awareness training'
      },
      {
        id: 'A.7.9',
        title: 'Storage media',
        description: 'Storage media shall be managed in accordance with the classification scheme adopted by the organization.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Media handling procedures with tracking and disposal protocols'
      },
      {
        id: 'A.7.10',
        title: 'Supporting utilities',
        description: 'Information processing facilities shall be protected from power failures and other disruptions caused by failures in supporting utilities.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'UPS systems and backup generators with regular testing'
      },
      {
        id: 'A.7.11',
        title: 'Cabling security',
        description: 'Power and telecommunications cabling carrying data or supporting information services shall be protected from interception, interference or damage.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Protected cable runs with physical security measures'
      },
      {
        id: 'A.7.12',
        title: 'Equipment maintenance',
        description: 'Equipment shall be correctly maintained to ensure its continued availability and integrity.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Preventive maintenance schedules with authorized service providers'
      },
      {
        id: 'A.7.13',
        title: 'Secure disposal or reuse of equipment',
        description: 'All items of equipment containing storage media shall be verified to ensure that any sensitive data and licensed software has been removed or securely overwritten prior to disposal or reuse.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Secure disposal procedures with certificate of destruction'
      },
      {
        id: 'A.7.14',
        title: 'Off-premises assets',
        description: 'Protection measures for off-premises assets shall consider the different risks of working outside the organization premises.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Asset tracking and protection policies for remote equipment'
      }
    ]
  },
  {
    id: 'A.8',
    title: 'Technological Controls',
    description: 'Technical security controls for information systems and networks',
    controls: [
      {
        id: 'A.8.1',
        title: 'User endpoint devices',
        description: 'Information stored on, processed by or accessible via user endpoint devices shall be protected.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Endpoint protection suite with device management and encryption'
      },
      {
        id: 'A.8.2',
        title: 'Privileged access rights',
        description: 'The allocation and use of privileged access rights shall be restricted and controlled.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Privileged access management with just-in-time elevation'
      },
      {
        id: 'A.8.3',
        title: 'Information access restriction',
        description: 'Access to information and application system functions shall be restricted in accordance with the access control policy.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Role-based access control with attribute-based enhancements'
      },
      {
        id: 'A.8.4',
        title: 'Access to source code',
        description: 'Read and write access to source code, development tools and software libraries shall be appropriately managed.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Source code repository protection with branch policies'
      },
      {
        id: 'A.8.5',
        title: 'Secure authentication',
        description: 'Secure authentication technologies and procedures shall be implemented based on access restrictions and the topic-specific policy on access control.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Multi-factor authentication with risk-based assessment'
      },
      {
        id: 'A.8.6',
        title: 'Capacity management',
        description: 'The use of resources shall be monitored and tuned, and projections of future capacity requirements shall be made to ensure the required system performance.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Automated capacity monitoring with predictive scaling'
      },
      {
        id: 'A.8.7',
        title: 'Protection against malware',
        description: 'Protection against malware shall be implemented and supported by appropriate user awareness.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Multi-layered malware protection with behavioral analysis'
      },
      {
        id: 'A.8.8',
        title: 'Management of technical vulnerabilities',
        description: 'Information about technical vulnerabilities of information systems being used shall be obtained in a timely fashion, the organization exposure to such vulnerabilities evaluated and appropriate measures taken to address the associated risk.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Vulnerability management program with automated scanning'
      },
      {
        id: 'A.8.9',
        title: 'Configuration management',
        description: 'Configurations, including security configurations, of hardware, software, services and networks shall be established, documented, implemented, monitored and reviewed.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Configuration management system with baseline enforcement'
      },
      {
        id: 'A.8.10',
        title: 'Information deletion',
        description: 'Information stored in information systems, devices or in any other storage media shall be deleted when no longer required.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Automated data retention policies with secure deletion procedures'
      },
      {
        id: 'A.8.11',
        title: 'Data masking',
        description: 'Data masking shall be used in accordance with the organization topic-specific policy on access control and other related topic-specific policies, and business requirements, taking applicable legislation into consideration.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Dynamic data masking for non-production environments'
      },
      {
        id: 'A.8.12',
        title: 'Data leakage prevention',
        description: 'Data leakage prevention measures shall be applied to systems, networks and any other devices that process, store or transmit sensitive information.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'DLP solution with content inspection and policy enforcement'
      },
      {
        id: 'A.8.13',
        title: 'Information backup',
        description: 'Backup copies of information, software and systems shall be maintained and regularly tested in accordance with the agreed topic-specific policy on backup.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Automated backup system with regular restore testing'
      },
      {
        id: 'A.8.14',
        title: 'Redundancy of information processing facilities',
        description: 'Information processing facilities shall be implemented with redundancy sufficient to meet availability requirements.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'High availability architecture with geographic distribution'
      },
      {
        id: 'A.8.15',
        title: 'Logging',
        description: 'Logs that record activities, exceptions, faults and other relevant events shall be produced, stored, protected and analyzed.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Centralized logging with SIEM integration and retention policies'
      },
      {
        id: 'A.8.16',
        title: 'Monitoring activities',
        description: 'Networks, systems and applications shall be monitored for anomalous behaviour and appropriate actions taken to evaluate potential information security incidents.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Real-time monitoring with AI-based anomaly detection'
      },
      {
        id: 'A.8.17',
        title: 'Clock synchronisation',
        description: 'The clocks of information processing systems used by the organization shall be synchronised to approved time sources.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'NTP infrastructure with authoritative time sources'
      },
      {
        id: 'A.8.18',
        title: 'Use of privileged utility programs',
        description: 'The use of utility programs that might be capable of overriding system and application controls shall be restricted and tightly controlled.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Restricted access to system utilities with logging and approval'
      },
      {
        id: 'A.8.19',
        title: 'Installation of software on operational systems',
        description: 'Procedures shall be implemented to control the installation of software on operational systems.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Software deployment pipeline with security scanning and approval'
      },
      {
        id: 'A.8.20',
        title: 'Networks security management',
        description: 'Networks and network devices shall be managed and controlled to protect information in systems and applications.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Network segmentation with micro-segmentation and monitoring'
      },
      {
        id: 'A.8.21',
        title: 'Security of network services',
        description: 'Security mechanisms, service levels and service requirements of network services shall be identified, implemented and monitored.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Network service hardening with security configuration baselines'
      },
      {
        id: 'A.8.22',
        title: 'Segregation of networks',
        description: 'Groups of information services, users and information systems shall be segregated on networks.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'VLAN segmentation with firewall enforcement between segments'
      },
      {
        id: 'A.8.23',
        title: 'Web filtering',
        description: 'Access to external websites shall be managed to reduce exposure to malicious content.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Web content filtering with category-based blocking and monitoring'
      },
      {
        id: 'A.8.24',
        title: 'Use of cryptography',
        description: 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Cryptographic standards with centralized key management system'
      },
      {
        id: 'A.8.25',
        title: 'Secure system development life cycle',
        description: 'Rules for the secure development of software and systems shall be established and applied.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Secure SDLC with security gates and code review requirements'
      },
      {
        id: 'A.8.26',
        title: 'Application security requirements',
        description: 'Information security requirements shall be identified, specified and approved when developing or acquiring applications.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Security requirements framework integrated into development process'
      },
      {
        id: 'A.8.27',
        title: 'Secure system architecture and engineering principles',
        description: 'Principles for engineering secure systems shall be established, documented, maintained and applied to any information system development activities.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: 'Security architecture principles with threat modeling integration'
      },
      {
        id: 'A.8.28',
        title: 'Secure coding',
        description: 'Secure coding principles shall be applied to software development.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Secure coding standards with static and dynamic analysis tools'
      },
      {
        id: 'A.8.29',
        title: 'Security testing in development and acceptance',
        description: 'Security testing processes shall be defined and implemented in the development life cycle.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BEST_PRACTICE],
        implementationDetails: 'Automated security testing integrated into CI/CD pipeline'
      },
      {
        id: 'A.8.30',
        title: 'Outsourced development',
        description: 'The organization shall direct, monitor and review the activities related to outsourced system development.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Vendor management program with security oversight for development'
      },
      {
        id: 'A.8.31',
        title: 'Separation of development, test and production environments',
        description: 'Development, testing and production environments shall be separated and secured.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.RISK_MANAGEMENT_REQUIREMENT],
        implementationDetails: 'Environment segregation with different security controls per environment'
      },
      {
        id: 'A.8.32',
        title: 'Change management',
        description: 'Changes to information processing facilities and information systems shall be subject to change management procedures.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'ITIL-based change management with security review gates'
      },
      {
        id: 'A.8.33',
        title: 'Test information',
        description: 'Test information shall be appropriately selected, protected and managed.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT, CONTROL_JUSTIFICATION.REGULATORY_REQUIREMENT],
        implementationDetails: 'Test data management with anonymization and synthetic data generation'
      },
      {
        id: 'A.8.34',
        title: 'Protection of information systems during audit testing',
        description: 'Audit tests and other assurance activities involving assessment of operational systems shall be planned and agreed between the tester and appropriate management.',
        controlStatus: 'Implemented',
        controlApplicability: 'Applicable',
        justification: [CONTROL_JUSTIFICATION.BUSINESS_REQUIREMENT],
        implementationDetails: 'Audit testing procedures with impact assessment and approval process'
      }
    ]
  }
];

async function seedSoAControls() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('cycorgi');
    const collection = db.collection('soa_controls');

    // Fetch existing risks for relationships
    console.log('🔍 Fetching existing risks...');
    const risksCollection = db.collection('risks');
    const risks = await risksCollection.find({}, { projection: { riskId: 1 } }).toArray();
    const existingRiskIds = risks.map(risk => risk.riskId).filter(Boolean);
    
    if (existingRiskIds.length > 0) {
      console.log(`📋 Found ${existingRiskIds.length} existing risks: ${existingRiskIds.slice(0, 5).join(', ')}${existingRiskIds.length > 5 ? '...' : ''}`);
    } else {
      console.log('⚠️  No existing risks found - controls will be created without risk associations');
    }

    // Clear existing controls
    await collection.deleteMany({});
    console.log('🗑️  Cleared existing SoA controls');

    // Prepare controls for insertion
    const controlsToInsert = [];
    let totalRiskAssociations = 0;

    for (const controlSet of iso27001Controls) {
      for (const control of controlSet.controls) {
        // Assign random related risks if available
        if (existingRiskIds.length > 0) {
          const relatedRisksCount = getRandomRelatedRisksCount();
          control.relatedRisks = getRandomElements(existingRiskIds, 3, Math.min(6, existingRiskIds.length));
          totalRiskAssociations += control.relatedRisks.length;
        } else {
          control.relatedRisks = [];
        }

        const controlDocument = {
          ...control,
          controlSetId: controlSet.id,
          controlSetTitle: controlSet.title,
          controlSetDescription: controlSet.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        controlsToInsert.push(controlDocument);
      }
    }

    // Insert all controls
    const result = await collection.insertMany(controlsToInsert);
    console.log(`✅ Successfully seeded ${result.insertedCount} ISO 27001:2022 SoA controls`);

    if (existingRiskIds.length > 0) {
      console.log(`🔗 Total related risk associations: ${totalRiskAssociations}`);
      console.log(`📊 Average related risks per control: ${(totalRiskAssociations / controlsToInsert.length).toFixed(1)}`);
    }

    // Create indexes for better performance
    console.log('🔧 Creating database indexes...');
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ controlStatus: 1 });
    await collection.createIndex({ controlApplicability: 1 });
    await collection.createIndex({ justification: 1 });
    await collection.createIndex({ relatedRisks: 1 });
    await collection.createIndex({ controlSetId: 1 });
    console.log('✅ Created indexes for SoA controls');

    // Show summary statistics
    console.log('\n📊 Seeding Summary:');
    console.log(`   📋 Total Controls: ${controlsToInsert.length}`);
    console.log(`   🏢 Control Sets: ${iso27001Controls.length}`);
    
    // Show control set breakdown
    console.log('\n📂 Control Set Breakdown:');
    iso27001Controls.forEach(set => {
      console.log(`   ${set.id}: ${set.controls.length} controls - ${set.title}`);
    });

    // Show justification distribution
    const justificationCounts = {};
    controlsToInsert.forEach(control => {
      control.justification.forEach(j => {
        justificationCounts[j] = (justificationCounts[j] || 0) + 1;
      });
    });

    console.log('\n🎯 Justification Distribution:');
    Object.entries(justificationCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([justification, count]) => {
        console.log(`   ${justification}: ${count} controls`);
      });

    // Show status distribution
    const statusCounts = {};
    controlsToInsert.forEach(control => {
      statusCounts[control.controlStatus] = (statusCounts[control.controlStatus] || 0) + 1;
    });

    console.log('\n📈 Control Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} controls`);
    });

    console.log('\n🎉 ISO 27001:2022 SOA controls seeding completed successfully!');
    console.log('   ✅ All 93 controls from ISO 27001:2022 Annex A');
    console.log('   ✅ Multi-justification support enabled');
    console.log('   ✅ Risk associations configured');
    console.log('   ✅ Database indexes optimized');

  } catch (error) {
    console.error('❌ Error seeding SoA controls:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Allow script to be run directly or imported
if (require.main === module) {
  seedSoAControls().catch(console.error);
}

module.exports = { seedSoAControls, iso27001Controls, CONTROL_JUSTIFICATION };
