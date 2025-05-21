import { Scenario } from "../types/simulation";

export const scenarios: Scenario[] = [
  {
    id: "s1",
    title: "BCA Term Renegotiation",
    description: "Experian alters reporting window requirements for major bank partners.",
    backgroundContext: "In this scenario, Experian is considering changes to Business Credit Agreements that would require banking partners to report credit data within a 15-day window instead of the current 30-day standard. This move is designed to improve data freshness but could create friction with long-standing bank partners who have built reporting systems around the 30-day cycle.",
    agents: [
      {
        id: "exp-cro",
        name: "James Reynolds",
        type: "Experian",
        role: "CRO",
        shortTermGoal: "Increase data reporting frequency without losing major accounts",
        longTermGoal: "Establish Experian as the most current and valuable data source",
        position: { x: 50, y: 50 }
      },
      {
        id: "exp-risk",
        name: "Sarah Chen",
        type: "Experian",
        role: "Risk Officer",
        shortTermGoal: "Maintain data quality during transition",
        longTermGoal: "Minimize regulatory scrutiny while improving competitive position",
        position: { x: 60, y: 60 }
      },
      {
        id: "eq-cro",
        name: "Michael Torres",
        type: "Equifax",
        role: "CRO",
        shortTermGoal: "Retain bank partners who might leave Experian",
        longTermGoal: "Position Equifax as the more bank-friendly bureau",
        position: { x: 30, y: 40 }
      },
      {
        id: "eq-risk",
        name: "David Wilson",
        type: "Equifax",
        role: "Risk Officer",
        shortTermGoal: "Monitor impact on shared bank relationships",
        longTermGoal: "Avoid regulatory attention while capitalizing on Experian's move",
        position: { x: 35, y: 50 }
      },
      {
        id: "tu-cro",
        name: "Alicia Montgomery",
        type: "TransUnion",
        role: "CRO",
        shortTermGoal: "Decide whether to match Experian's reporting window changes",
        longTermGoal: "Differentiate TransUnion's value proposition to banks",
        position: { x: 70, y: 30 }
      },
      {
        id: "tu-risk",
        name: "Robert Keane",
        type: "TransUnion",
        role: "Risk Officer",
        shortTermGoal: "Assess data completeness impact of different reporting windows",
        longTermGoal: "Create a sustainable competitive advantage in the bureau ecosystem",
        position: { x: 75, y: 40 }
      }
    ],
    initialRelationships: {
      "exp-cro": {
        "exp-risk": { trust: 90, influence: 70 },
        "eq-cro": { trust: 50, influence: 60 },
        "eq-risk": { trust: 40, influence: 40 },
        "tu-cro": { trust: 55, influence: 65 },
        "tu-risk": { trust: 45, influence: 40 }
      },
      "exp-risk": {
        "exp-cro": { trust: 85, influence: 65 },
        "eq-cro": { trust: 40, influence: 30 },
        "eq-risk": { trust: 60, influence: 50 },
        "tu-cro": { trust: 45, influence: 30 },
        "tu-risk": { trust: 65, influence: 55 }
      },
      "eq-cro": {
        "exp-cro": { trust: 45, influence: 55 },
        "exp-risk": { trust: 35, influence: 25 },
        "eq-risk": { trust: 80, influence: 65 },
        "tu-cro": { trust: 60, influence: 50 },
        "tu-risk": { trust: 40, influence: 35 }
      },
      "eq-risk": {
        "exp-cro": { trust: 30, influence: 40 },
        "exp-risk": { trust: 55, influence: 45 },
        "eq-cro": { trust: 75, influence: 60 },
        "tu-cro": { trust: 45, influence: 35 },
        "tu-risk": { trust: 65, influence: 55 }
      },
      "tu-cro": {
        "exp-cro": { trust: 50, influence: 60 },
        "exp-risk": { trust: 40, influence: 30 },
        "eq-cro": { trust: 65, influence: 55 },
        "eq-risk": { trust: 40, influence: 30 },
        "tu-risk": { trust: 85, influence: 70 }
      },
      "tu-risk": {
        "exp-cro": { trust: 40, influence: 35 },
        "exp-risk": { trust: 60, influence: 50 },
        "eq-cro": { trust: 35, influence: 30 },
        "eq-risk": { trust: 60, influence: 50 },
        "tu-cro": { trust: 80, influence: 65 }
      }
    },
    moves: [
      {
        id: "m1",
        title: "Announce 15-day Reporting Requirement",
        description: "Publicly announce the transition to a 15-day reporting window for all banking partners.",
        type: "Regulate",
        impacts: {
          "exp-cro": { trust: 0, influence: 10 },
          "exp-risk": { trust: -5, influence: 5 },
          "eq-cro": { trust: -15, influence: -5 },
          "eq-risk": { trust: -10, influence: 0 },
          "tu-cro": { trust: -10, influence: -5 },
          "tu-risk": { trust: -5, influence: 0 }
        }
      },
      {
        id: "m2",
        title: "Tiered Implementation Program",
        description: "Offer a phased approach with tiered deadlines based on bank size and technical capabilities.",
        type: "Collaborate",
        impacts: {
          "exp-cro": { trust: 5, influence: 5 },
          "exp-risk": { trust: 10, influence: 0 },
          "eq-cro": { trust: 5, influence: -5 },
          "eq-risk": { trust: 10, influence: 0 },
          "tu-cro": { trust: 5, influence: -5 },
          "tu-risk": { trust: 10, influence: 0 }
        }
      },
      {
        id: "m3",
        title: "Premium Analysis Products",
        description: "Launch new premium analytics products that showcase the value of faster reporting data.",
        type: "Innovate",
        impacts: {
          "exp-cro": { trust: 15, influence: 20 },
          "exp-risk": { trust: 10, influence: 15 },
          "eq-cro": { trust: -15, influence: -10 },
          "eq-risk": { trust: -5, influence: -5 },
          "tu-cro": { trust: -15, influence: -10 },
          "tu-risk": { trust: -5, influence: -5 }
        }
      },
      {
        id: "m4",
        title: "Industry Taskforce Formation",
        description: "Propose an industry-wide taskforce to standardize reporting timeframes across all bureaus.",
        type: "Consolidate",
        impacts: {
          "exp-cro": { trust: 10, influence: 15 },
          "exp-risk": { trust: 15, influence: 10 },
          "eq-cro": { trust: 10, influence: -5 },
          "eq-risk": { trust: 15, influence: 0 },
          "tu-cro": { trust: 10, influence: -5 },
          "tu-risk": { trust: 15, influence: 0 }
        }
      },
      {
        id: "m5",
        title: "Exclusive Partnership Program",
        description: "Establish exclusive partnerships with early-adopting banks, offering them preferential terms.",
        type: "Compete",
        impacts: {
          "exp-cro": { trust: 20, influence: 25 },
          "exp-risk": { trust: 15, influence: 20 },
          "eq-cro": { trust: -25, influence: -20 },
          "eq-risk": { trust: -15, influence: -10 },
          "tu-cro": { trust: -25, influence: -20 },
          "tu-risk": { trust: -15, influence: -10 }
        }
      }
    ],
    currentMoveIndex: 0,
    status: "Rising Tension",
    imageSrc: "/placeholder.svg"
  },
  {
    id: "s2",
    title: "Data Sovereignty Challenge",
    description: "Regulatory changes force reconsideration of cross-border data handling.",
    backgroundContext: "New regulations in the EU and Asia are creating data sovereignty challenges for all credit bureaus. Experian must decide how to adjust its global data strategy while maintaining competitive relations with other bureaus who face similar challenges.",
    agents: [
      {
        id: "exp-cro",
        name: "James Reynolds",
        type: "Experian",
        role: "CRO",
        shortTermGoal: "Adapt to new regulations with minimal business disruption",
        longTermGoal: "Turn data sovereignty into a competitive advantage",
        position: { x: 50, y: 50 }
      },
      {
        id: "exp-risk",
        name: "Sarah Chen",
        type: "Experian",
        role: "Risk Officer",
        shortTermGoal: "Ensure full compliance across all markets",
        longTermGoal: "Build most trusted data governance framework in the industry",
        position: { x: 60, y: 60 }
      },
      {
        id: "eq-cro",
        name: "Michael Torres",
        type: "Equifax",
        role: "CRO",
        shortTermGoal: "Minimize revenue impact of regulatory changes",
        longTermGoal: "Use regional expertise to claim market share",
        position: { x: 30, y: 40 }
      },
      {
        id: "eq-risk",
        name: "David Wilson",
        type: "Equifax",
        role: "Risk Officer",
        shortTermGoal: "Develop compliant data architecture",
        longTermGoal: "Create standardized approach to global data regulations",
        position: { x: 35, y: 50 }
      },
      {
        id: "tu-cro",
        name: "Alicia Montgomery",
        type: "TransUnion",
        role: "CRO",
        shortTermGoal: "Protect core markets while adapting to new rules",
        longTermGoal: "Position TransUnion as the most adaptable bureau",
        position: { x: 70, y: 30 }
      },
      {
        id: "tu-risk",
        name: "Robert Keane",
        type: "TransUnion",
        role: "Risk Officer",
        shortTermGoal: "Restructure data flows to meet new requirements",
        longTermGoal: "Establish industry-leading compliance framework",
        position: { x: 75, y: 40 }
      }
    ],
    initialRelationships: {
      "exp-cro": {
        "exp-risk": { trust: 85, influence: 70 },
        "eq-cro": { trust: 55, influence: 60 },
        "eq-risk": { trust: 45, influence: 40 },
        "tu-cro": { trust: 50, influence: 55 },
        "tu-risk": { trust: 40, influence: 35 }
      },
      "exp-risk": {
        "exp-cro": { trust: 80, influence: 65 },
        "eq-cro": { trust: 35, influence: 30 },
        "eq-risk": { trust: 60, influence: 50 },
        "tu-cro": { trust: 40, influence: 30 },
        "tu-risk": { trust: 60, influence: 50 }
      },
      "eq-cro": {
        "exp-cro": { trust: 50, influence: 55 },
        "exp-risk": { trust: 30, influence: 25 },
        "eq-risk": { trust: 75, influence: 65 },
        "tu-cro": { trust: 60, influence: 50 },
        "tu-risk": { trust: 40, influence: 35 }
      },
      "eq-risk": {
        "exp-cro": { trust: 35, influence: 40 },
        "exp-risk": { trust: 55, influence: 45 },
        "eq-cro": { trust: 70, influence: 60 },
        "tu-cro": { trust: 40, influence: 35 },
        "tu-risk": { trust: 60, influence: 50 }
      },
      "tu-cro": {
        "exp-cro": { trust: 45, influence: 50 },
        "exp-risk": { trust: 35, influence: 30 },
        "eq-cro": { trust: 65, influence: 55 },
        "eq-risk": { trust: 40, influence: 30 },
        "tu-risk": { trust: 80, influence: 70 }
      },
      "tu-risk": {
        "exp-cro": { trust: 35, influence: 35 },
        "exp-risk": { trust: 55, influence: 50 },
        "eq-cro": { trust: 35, influence: 30 },
        "eq-risk": { trust: 55, influence: 45 },
        "tu-cro": { trust: 75, influence: 65 }
      }
    },
    moves: [
      {
        id: "m1-s2",
        title: "Regional Data Centers",
        description: "Invest in region-specific data centers to comply with local data residency requirements.",
        type: "Innovate",
        impacts: {
          "exp-cro": { trust: 5, influence: 15 },
          "exp-risk": { trust: 20, influence: 10 },
          "eq-cro": { trust: -10, influence: -15 },
          "eq-risk": { trust: 5, influence: 0 },
          "tu-cro": { trust: -10, influence: -15 },
          "tu-risk": { trust: 5, influence: 0 }
        }
      },
      {
        id: "m2-s2",
        title: "Global Standardization Initiative",
        description: "Lead industry effort to standardize cross-border data handling protocols.",
        type: "Consolidate",
        impacts: {
          "exp-cro": { trust: 10, influence: 20 },
          "exp-risk": { trust: 15, influence: 15 },
          "eq-cro": { trust: 10, influence: 5 },
          "eq-risk": { trust: 15, influence: 10 },
          "tu-cro": { trust: 10, influence: 5 },
          "tu-risk": { trust: 15, influence: 10 }
        }
      },
      {
        id: "m3-s2",
        title: "Localized Operations Model",
        description: "Restructure into semi-autonomous regional businesses with local data sovereignty.",
        type: "Regulate",
        impacts: {
          "exp-cro": { trust: -5, influence: -10 },
          "exp-risk": { trust: 15, influence: 5 },
          "eq-cro": { trust: 5, influence: -5 },
          "eq-risk": { trust: 10, influence: 0 },
          "tu-cro": { trust: 5, influence: -5 },
          "tu-risk": { trust: 10, influence: 0 }
        }
      }
    ],
    currentMoveIndex: 0,
    status: "Strategic Gain",
    imageSrc: "/placeholder.svg"
  },
  {
    id: "s3",
    title: "API Standardization Initiative",
    description: "Experian proposes industry-wide API standards for credit data access.",
    backgroundContext: "As fintech innovation accelerates, inconsistent APIs between bureaus are creating inefficiency across the ecosystem. Experian is considering leading an API standardization effort that could reshape competitive dynamics between the major bureaus.",
    agents: [
      {
        id: "exp-cro",
        name: "James Reynolds",
        type: "Experian",
        role: "CRO",
        shortTermGoal: "Position Experian as the technical leader in the industry",
        longTermGoal: "Create platform-based revenue streams through API adoption",
        position: { x: 50, y: 50 }
      },
      {
        id: "exp-risk",
        name: "Sarah Chen",
        type: "Experian",
        role: "Risk Officer",
        shortTermGoal: "Ensure API standardization doesn't expose proprietary methods",
        longTermGoal: "Minimize data security risks while enabling innovation",
        position: { x: 60, y: 60 }
      },
      {
        id: "eq-cro",
        name: "Michael Torres",
        type: "Equifax",
        role: "CRO",
        shortTermGoal: "Protect Equifax's unique data offerings",
        longTermGoal: "Maintain differentiation in product features",
        position: { x: 30, y: 40 }
      },
      {
        id: "eq-risk",
        name: "David Wilson",
        type: "Equifax",
        role: "Risk Officer",
        shortTermGoal: "Evaluate security implications of standardized APIs",
        longTermGoal: "Ensure compliance while minimizing technical debt",
        position: { x: 35, y: 50 }
      },
      {
        id: "tu-cro",
        name: "Alicia Montgomery",
        type: "TransUnion",
        role: "CRO",
        shortTermGoal: "Leverage TransUnion's advanced modeling techniques",
        longTermGoal: "Expand fintech partnerships through enhanced APIs",
        position: { x: 70, y: 30 }
      },
      {
        id: "tu-risk",
        name: "Robert Keane",
        type: "TransUnion",
        role: "Risk Officer",
        shortTermGoal: "Protect proprietary algorithms while enabling standardization",
        longTermGoal: "Create sustainable competitive advantage through data science",
        position: { x: 75, y: 40 }
      }
    ],
    initialRelationships: {
      "exp-cro": {
        "exp-risk": { trust: 85, influence: 70 },
        "eq-cro": { trust: 45, influence: 55 },
        "eq-risk": { trust: 35, influence: 40 },
        "tu-cro": { trust: 50, influence: 55 },
        "tu-risk": { trust: 40, influence: 35 }
      },
      "exp-risk": {
        "exp-cro": { trust: 80, influence: 65 },
        "eq-cro": { trust: 30, influence: 25 },
        "eq-risk": { trust: 55, influence: 50 },
        "tu-cro": { trust: 35, influence: 30 },
        "tu-risk": { trust: 55, influence: 50 }
      },
      "eq-cro": {
        "exp-cro": { trust: 40, influence: 50 },
        "exp-risk": { trust: 25, influence: 20 },
        "eq-risk": { trust: 75, influence: 65 },
        "tu-cro": { trust: 60, influence: 55 },
        "tu-risk": { trust: 35, influence: 30 }
      },
      "eq-risk": {
        "exp-cro": { trust: 30, influence: 35 },
        "exp-risk": { trust: 50, influence: 45 },
        "eq-cro": { trust: 70, influence: 60 },
        "tu-cro": { trust: 35, influence: 30 },
        "tu-risk": { trust: 55, influence: 45 }
      },
      "tu-cro": {
        "exp-cro": { trust: 45, influence: 50 },
        "exp-risk": { trust: 30, influence: 25 },
        "eq-cro": { trust: 55, influence: 50 },
        "eq-risk": { trust: 30, influence: 25 },
        "tu-risk": { trust: 80, influence: 70 }
      },
      "tu-risk": {
        "exp-cro": { trust: 35, influence: 30 },
        "exp-risk": { trust: 50, influence: 45 },
        "eq-cro": { trust: 30, influence: 25 },
        "eq-risk": { trust: 50, influence: 40 },
        "tu-cro": { trust: 75, influence: 65 }
      }
    },
    moves: [
      {
        id: "m1-s3",
        title: "Open API Framework",
        description: "Propose fully open-source API standards with collaborative governance.",
        type: "Collaborate",
        impacts: {
          "exp-cro": { trust: 15, influence: 25 },
          "exp-risk": { trust: -5, influence: 10 },
          "eq-cro": { trust: 10, influence: -5 },
          "eq-risk": { trust: -10, influence: -5 },
          "tu-cro": { trust: 15, influence: 5 },
          "tu-risk": { trust: -5, influence: 0 }
        }
      },
      {
        id: "m2-s3",
        title: "Experian-Led Consortium",
        description: "Form a consortium with Experian as the technical leader and standard-setter.",
        type: "Consolidate",
        impacts: {
          "exp-cro": { trust: 20, influence: 30 },
          "exp-risk": { trust: 15, influence: 20 },
          "eq-cro": { trust: -20, influence: -15 },
          "eq-risk": { trust: -10, influence: -5 },
          "tu-cro": { trust: -15, influence: -10 },
          "tu-risk": { trust: -5, influence: 0 }
        }
      },
      {
        id: "m3-s3",
        title: "Regulatory Advocacy",
        description: "Engage regulators to mandate industry-wide API standardization.",
        type: "Regulate",
        impacts: {
          "exp-cro": { trust: -5, influence: 15 },
          "exp-risk": { trust: 20, influence: 10 },
          "eq-cro": { trust: -25, influence: -20 },
          "eq-risk": { trust: 10, influence: -5 },
          "tu-cro": { trust: -20, influence: -15 },
          "tu-risk": { trust: 15, influence: 0 }
        }
      },
      {
        id: "m4-s3",
        title: "Premium API Tiering",
        description: "Create tiered API access with premium features for paid partners.",
        type: "Compete",
        impacts: {
          "exp-cro": { trust: 25, influence: 20 },
          "exp-risk": { trust: 15, influence: 10 },
          "eq-cro": { trust: -15, influence: -25 },
          "eq-risk": { trust: -5, influence: -10 },
          "tu-cro": { trust: -10, influence: -20 },
          "tu-risk": { trust: -5, influence: -5 }
        }
      }
    ],
    currentMoveIndex: 0,
    status: "Ecosystem Shock",
    imageSrc: "/placeholder.svg"
  }
];
