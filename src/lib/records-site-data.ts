export interface RecordsService {
  number: string;
  name: string;
  principle: string;
  summary: string;
  detailTitle: string;
  provides: string[];
  boundaries: string[];
  detailSections: Array<{ title: string; lines: string[] }>;
}

export const recordsServices: RecordsService[] = [
  {
    number: "01",
    name: "Production",
    principle: "Serve the field.",
    summary: "We build the room. You fill it.",
    detailTitle: "Full recorded infrastructure",
    provides: [
      "Recording studio access with proven engineers",
      "Mixing and mastering partnerships",
      "Creative direction for album art and visual assets",
      "Video production for singles and visualizers",
      "Physical manufacturing coordination across vinyl, CD, and cassette",
    ],
    boundaries: [
      "Rush deadlines for commercial pressure",
      "Compromise sound quality for cost savings",
      "Ghost production without credit",
    ],
    detailSections: [
      {
        title: "Timeline",
        lines: [
          "First recording session within 30 days of signing",
          "Album completion: 6–9 months, flexible by project",
        ],
      },
      {
        title: "Cost",
        lines: [
          "Advances against royalties: 15–25%",
          "Production costs recoup from recordings, not master ownership",
          "Artist retains 100% of publishing",
        ],
      },
    ],
  },
  {
    number: "02",
    name: "Management",
    principle: "Honor the artist.",
    summary: "Your career, your pace, your vision. We hold the structure.",
    detailTitle: "Dedicated partnership, not ownership",
    provides: [
      "Dedicated account manager per artist",
      "Quarterly strategy reviews with written deliverables",
      "Team building through publicist, booking agent, and lawyer introductions",
      "Real-time royalty visibility dashboard",
      "Mental health resources including therapy stipend and crisis support",
    ],
    boundaries: [
      "Make decisions without your consent",
      "Lock you into multi-album contracts without opt-out clauses",
      "Hide backend numbers from the people who earned them",
    ],
    detailSections: [
      {
        title: "Communication",
        lines: [
          "Weekly 15-minute check-ins by call, Slack, or email",
          "Monthly financial statements",
          "Quarterly strategy documents and live presentations",
        ],
      },
    ],
  },
  {
    number: "03",
    name: "Booking",
    principle: "Support the flow.",
    summary: "The road opens when the room is ready. We route it.",
    detailTitle: "The road opens when the room is ready",
    provides: [
      "Tour routing optimization across geography, venue size, and budget",
      "Festival submission coordination",
      "Private event bookings for corporate, gallery, and brand activations",
      "Tour support budget allocation",
      "Opening-slot negotiations with established acts",
    ],
    boundaries: [
      "Overpromise attendance numbers",
      "Book venues without guaranteed minimums",
      "Commit to shows without rider approval",
    ],
    detailSections: [
      {
        title: "Philosophy",
        lines: [
          "Build live infrastructure before the headline tour.",
          "Two cities. Three cities. Five cities. Prove the connection. Expand the map.",
        ],
      },
      {
        title: "Commission",
        lines: [
          "Standard 15% on gross booking revenue",
          "No hidden fees",
          "No percentage of merch unless specified",
        ],
      },
    ],
  },
  {
    number: "04",
    name: "Distribution",
    principle: "Serve the field.",
    summary: "Your work reaches every platform without surrendering ownership.",
    detailTitle: "Reach without surrender",
    provides: [
      "Digital streaming platform delivery",
      "Social platform distribution",
      "Physical distribution partnerships",
      "Bandcamp integration for direct-to-fan sales and exclusive editions",
      "Metadata optimization across ISRC codes, credits, and lyric syncing",
    ],
    boundaries: [
      "Exclusive deals locking content to one platform",
      "Withhold royalties for administrative fees",
      "Claim master ownership as a condition of distribution",
    ],
    detailSections: [
      {
        title: "Royalty flow",
        lines: [
          "Platform → Whole Body Records accounting → artist payout",
          "Payout within 90 days of receipt",
          "Statements downloadable anytime",
        ],
      },
      {
        title: "Ownership",
        lines: [
          "Artist owns master recordings",
          "Whole Body Records administers for five years",
          "Rights revert automatically after term",
        ],
      },
    ],
  },
  {
    number: "05",
    name: "Press",
    principle: "Honor the artist.",
    summary: "Your story, told accurately. We don’t manufacture narratives.",
    detailTitle: "Your story, told accurately",
    provides: [
      "Media outreach strategy from local to national",
      "Pitch deck creation with bio, images, sound clips, and talking points",
      "Interview coordination across podcast, print, video, and radio",
      "Review campaigns across appropriate publications",
      "Crisis communications when needed",
    ],
    boundaries: [
      "Buy reviews or fake engagement",
      "Spin stories that contradict your narrative",
      "Burn journalist relationships for short-term gain",
    ],
    detailSections: [
      {
        title: "Rollout",
        lines: [
          "Month 1: blog coverage and playlist pitching",
          "Month 2: regional radio and local profiles",
          "Month 3: national outreach and major interviews",
        ],
      },
      {
        title: "Measurement",
        lines: [
          "A shared weekly record of placements, reach estimates, and sentiment during rollout",
        ],
      },
    ],
  },
  {
    number: "06",
    name: "Licensing",
    principle: "Support the flow.",
    summary: "Your music finds its second life. We negotiate. You approve.",
    detailTitle: "Your music finds its second life",
    provides: [
      "Music-library submission to sync agencies",
      "Direct pitches to music supervisors across film, television, games, and advertising",
      "Cue-sheet filing and performance royalty collection",
      "Negotiation across exclusivity, territory, and duration",
      "Catalog clearance for sample rights",
    ],
    boundaries: [
      "Sell music outright through an unapproved buyout",
      "License to brands that conflict with your values",
      "Place work in projects you have not approved",
    ],
    detailSections: [
      {
        title: "Illustrative fee ranges",
        lines: [
          "Background cue: $500–$2,000",
          "Featured use: $2,000–$10,000",
          "Main title/theme: $10,000–$50,000+",
          "Commercial sync: $25,000–$250,000+",
        ],
      },
      {
        title: "Split and reporting",
        lines: [
          "70% artist / 30% Whole Body Records administration",
          "Monthly report of pitches, closed deals, and pending negotiations",
          "All contracts reviewed by external counsel",
        ],
      },
    ],
  },
];

export const recordsTimeline = [
  ["Day 1", "Signing complete. Welcome packet sent. Account access activated."],
  ["Week 1", "Production kickoff meeting. Studio booking confirmed."],
  ["Month 1", "First recording session. Social asset creation begins."],
  ["Month 2", "Publicist introduction. Press kit drafted."],
  ["Month 3", "Booking agent introduction. Festival submissions opened."],
  ["Months 4–6", "Album production continues. Sync library submission."],
  ["Month 7", "Single release one. Press campaign activates."],
  ["Month 8", "Single release two. Tour routing finalized."],
  ["Month 9", "Album release. Full rollout live."],
  ["Months 10–12", "Tour execution. Sync deals close. Next-quarter planning."],
] as const;

export const recordsFaq = [
  [
    "Do I have to give up my master recordings?",
    "No. You own your masters. Whole Body Records administers for five years, then rights revert automatically.",
  ],
  [
    "What’s the typical contract length?",
    "Three-year minimum with clear opt-out clauses. No auto-renewals without mutual agreement.",
  ],
  [
    "Can I keep my existing producer or engineer team?",
    "Yes. We introduce partners when useful, not mandatory. Your creative choices remain yours.",
  ],
  [
    "How transparent are the royalty numbers?",
    "Fully. Real-time dashboard access, downloadable monthly statements, and visibility across revenue streams.",
  ],
  [
    "What if I don’t fit a specific genre?",
    "Good. Genre is not our framework. We work with artists whose work lives in the body, regardless of category.",
  ],
  [
    "Can I submit a demo without committing to a contract?",
    "Absolutely. Submission is non-binding. We review and respond within 14 business days.",
  ],
  [
    "What mental health resources do you offer?",
    "A therapy stipend of $2,500 per year, crisis-support access, and built-in rest periods between project cycles.",
  ],
  [
    "How do sync deals work?",
    "We pitch your catalog. You approve or decline every placement. The standard split is 70% to you and 30% to administration.",
  ],
  [
    "Can I book my own shows?",
    "Yes. Our team can optimize routing and negotiate guarantees while you retain agency over the performance.",
  ],
  [
    "What happens if I want to leave the label?",
    "Contract terms include exit clauses. Upon departure, rights revert on the agreed schedule and the separation remains professional.",
  ],
] as const;
