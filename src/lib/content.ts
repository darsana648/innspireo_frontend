/**
 * Static editorial content.
 *
 * FAQs: the live site shipped only five questions. These expand on them and are
 * written against how placement actually works (agency model, no candidate
 * fees, employer disclosed at shortlisting).
 *
 * Blog posts: the Laravel backend has no blogs API (`/api/blogs` is a 404), so
 * the three live articles are referenced by their real slugs and link to the
 * existing site until an endpoint exists. Do not invent article bodies here.
 */

export interface FaqEntry {
  question: string;
  answer: string;
  group: "Applying" | "Placement" | "Working abroad" | "Employers";
}

export const FAQS: FaqEntry[] = [
  {
    group: "Applying",
    question: "Does it cost anything to apply or be placed?",
    answer:
      "No. Innspireo never charges candidates a registration, application or placement fee. Our fees are paid by the employers who hire. If anyone asks you for money in our name, report it to us immediately.",
  },
  {
    group: "Applying",
    question: "Do I need previous hospitality experience?",
    answer:
      "For most roles, yes — our clients hire against specific departmental experience. We do carry entry-level and trainee positions from time to time, so create a profile and set your department even if you are early in your career.",
  },
  {
    group: "Applying",
    question: "Do I need to apply separately to every job?",
    answer:
      "You can, but you do not have to. Your profile and documents stay on file, so once you have applied to one role our team can match you to future vacancies in the same department without you re-uploading anything.",
  },
  {
    group: "Applying",
    question: "What documents should I have ready?",
    answer:
      "An up-to-date CV, your passport (with at least six months validity), photographs of any hospitality certificates or diplomas, and reference contacts from previous properties. For Gulf roles you will later need educational certificate attestation and a medical.",
  },
  {
    group: "Applying",
    question: "How will I know if my application progressed?",
    answer:
      "Our team reviews every application against the client brief and comes back to you either way. If you are shortlisted we contact you to confirm your availability and prepare you for the interview format the employer uses.",
  },
  {
    group: "Placement",
    question: "Why is the employer's name not shown on the job listing?",
    answer:
      "Innspireo recruits on behalf of client employers, and we do not publish their names on open listings — this is standard practice in overseas placement and protects the client's hiring plans. The employer, the property and the full package are disclosed to you during shortlisting, before any interview.",
  },
  {
    group: "Placement",
    question: "Who actually employs me?",
    answer:
      "The client employer does. Innspireo recruits, screens and mobilises you, and your employment contract is with the hotel or catering group you are placed into.",
  },
  {
    group: "Placement",
    question: "How long does the whole process take?",
    answer:
      "It varies by market and role. Shortlisting is usually within one to three weeks of applying. Once an offer is made, documentation, visa processing and travel typically take a further four to ten weeks depending on the destination country.",
  },
  {
    group: "Placement",
    question: "How are interviews conducted?",
    answer:
      "Most clients interview by video call. Kitchen roles often include a practical trade test, which may be conducted locally or on arrival. We tell you the format and help you prepare before you meet the employer.",
  },
  {
    group: "Working abroad",
    question: "Is accommodation and food provided?",
    answer:
      "On most Gulf contracts, yes — shared accommodation and duty meals are commonly included, and the individual listing states what is offered. European contracts vary more, and are usually salary-led with accommodation assistance rather than provision.",
  },
  {
    group: "Working abroad",
    question: "Do you handle the visa and travel?",
    answer:
      "Yes. Once an offer is confirmed we coordinate attestation, medicals, visa processing and flights through to your arrival and start date.",
  },
  {
    group: "Working abroad",
    question: "Which countries do you place into?",
    answer:
      "Currently Kuwait, Oman, Qatar and Bahrain in the Gulf, plus Germany and the Netherlands in Europe. Live vacancy counts per country are shown on the destinations pages.",
  },
  {
    group: "Working abroad",
    question: "Are salaries quoted monthly or annually?",
    answer:
      "It depends on the market, so each listing shows the figure with its period next to it. Gulf packages are generally quoted monthly and are tax-free in the host country; European roles are usually quoted as an annual gross salary.",
  },
  {
    group: "Employers",
    question: "How do I post a vacancy as an employer?",
    answer:
      "Employers do not post directly. Send us a hiring brief through the Hire With Us page or call our recruitment desk, and our team builds and manages the vacancy for you, returning a screened shortlist rather than a database of CVs.",
  },
];

export interface BlogPost {
  title: string;
  slug: string;
  /** Absolute URL on the existing site, until a blogs API exists. */
  externalUrl: string;
  category: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    title: "Every hotel saw the same data. Only some saw it coming.",
    slug: "every-hotel-saw-the-same-data-only-some-saw-it-coming-1786428593",
    externalUrl:
      "https://jobs.innspireo.com/blogs/every-hotel-saw-the-same-data-only-some-saw-it-coming-1786428593",
    category: "Industry",
  },
  {
    title: "The quiet corner of Kerala that tourism almost forgot",
    slug: "the-quiet-corner-of-kerala-that-tourism-almost-forgot-1789107807",
    externalUrl:
      "https://jobs.innspireo.com/blogs/the-quiet-corner-of-kerala-that-tourism-almost-forgot-1789107807",
    category: "Destinations",
  },
  {
    title: "What interviewing hospitality professionals has taught me so far",
    slug: "what-interviewing-hospitality-professionals-has-taught-me-so-far-1787036217",
    externalUrl:
      "https://jobs.innspireo.com/blogs/what-interviewing-hospitality-professionals-has-taught-me-so-far-1787036217",
    category: "Careers",
  },
];


/* -------------------------------------------------------------------------- */
/*  Company + services                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Sourced from the live corporate site (innspireo.com), specifically
 * /innspire-hospitality-services/ and /about-innspireo-hospitality-industry/.
 * Wording is condensed but the substance, service names and the mission and
 * vision statements are the company's own — nothing here is invented.
 *
 * Note for the team: the corporate site's own menu links to /about-us,
 * /our-services and /pricing, and all three return 404. The live pages are
 * /about-innspireo-hospitality-industry/ and /innspire-hospitality-services/.
 */

export interface ServiceEntry {
  slug: string;
  title: string;
  tagline: string;
  body: string;
  /** Short bullets shown under the body. */
  points: string[];
}

export const SERVICES: ServiceEntry[] = [
  {
    slug: "recruitment",
    title: "Recruitment & Talent Acquisition",
    tagline: "Hire the best, build the best",
    body:
      "Your team defines your guest experience. We recruit skilled, reliable professionals across every hospitality department — chefs, service staff, housekeeping, front office and management — and we screen and test them before they reach your interview.",
    points: [
      "Permanent placements across all hospitality departments",
      "Candidates screened and trade-tested before shortlisting",
      "Indian talent placed with employers in the Gulf and Europe",
    ],
  },
  {
    slug: "hr-consultancy",
    title: "HR Consultancy",
    tagline: "Strong HR systems, stronger business",
    body:
      "A smooth-running business needs a solid HR backbone. From statutory compliance and payroll to employee policy and workforce planning, we give your operation the structure it needs to grow without legal risk or operational gaps.",
    points: [
      "Payroll, policy and labour-law compliance",
      "Workforce planning and organisation structure",
      "Audit-ready documentation",
    ],
  },
  {
    slug: "training",
    title: "Training & Development",
    tagline: "Great service starts with a great team",
    body:
      "Customised programmes covering guest handling, communication, leadership and service excellence, plus technical skills and corporate workshops. Well-trained teams work faster, waste less and give guests a better experience.",
    points: [
      "Technical and soft-skills training",
      "Leadership and corporate workshops",
      "Measured on wastage, speed and guest feedback",
    ],
  },
  {
    slug: "new-projects",
    title: "New Project Launch Support",
    tagline: "Turn a hospitality plan into a working business",
    body:
      "Opening a café, restaurant or hotel. We guide concept planning, feasibility, design coordination, menu development, SOP creation and pre-opening operations — through to the day you trade.",
    points: [
      "Feasibility studies and design support",
      "Menu development and costing",
      "SOPs and pre-opening operations",
    ],
  },
  {
    slug: "turnaround",
    title: "Turnaround & Profit Boosting",
    tagline: "Fix what is broken, grow what works",
    body:
      "If a property is facing losses, poor ratings or operational problems, we step in. Expert audits, cost control and revenue strategy to restore profitability and tighten daily operations.",
    points: [
      "Operational and cost audits",
      "Revenue and margin optimisation",
      "Reviving underperforming properties",
    ],
  },
  {
    slug: "branding",
    title: "Sales, Branding & Digital Marketing",
    tagline: "Make the brand impossible to ignore",
    body:
      "Visibility turns into bookings. We build hospitality brands through SEO, social media, advertising, print and PR — improving recall and filling covers.",
    points: [
      "SEO, social and paid media",
      "Print, collateral and PR campaigns",
      "Revenue-led brand positioning",
    ],
  },
  {
    slug: "management",
    title: "Third-Party Management, Leasing & Franchising",
    tagline: "Grow without growing the daily load",
    body:
      "Professional management contracts, leasing models and franchise support — for owners who want growth and stable returns without running the operation day to day.",
    points: [
      "Full management contracts",
      "Leasing and franchise models",
      "Owner reporting and governance",
    ],
  },
  {
    slug: "star-rating",
    title: "Classification & Star-Rating Guidance",
    tagline: "Get the stars the property deserves",
    body:
      "Star ratings drive trust and visibility. We guide properties through documentation, audits and compliance checks to achieve official classification.",
    points: [
      "Documentation and audit preparation",
      "Compliance gap analysis",
      "Official classification support",
    ],
  },
  {
    slug: "events",
    title: "Events & Outdoor Catering",
    tagline: "Your event, our execution",
    body:
      "Weddings, private parties, corporate events and outdoor catering — planning, décor, food, logistics and guest experience managed end to end.",
    points: [
      "Social and corporate events",
      "Customised outdoor catering",
      "Logistics and on-site execution",
    ],
  },
];

/** Mission and vision, taken from the corporate site. */
export const COMPANY = {
  headline: "Build exceptional hospitality, all under one roof",
  intro:
    "Innspireo Hospitality Management LLP is a 360° hospitality solutions provider headquartered in Kochi, Kerala, drawing on nearly three decades of industry experience. We work with hotels, restaurants, cafés, function halls and catering businesses — locally and internationally.",
  missionTitle: "To make hospitality businesses profitable and hospitality careers rewarding.",
  missionBody:
    "We do that in three ways. We place skilled talent with employers who genuinely need them, screened and tested before they reach your interview. We give operators the operational support they cannot afford to build in-house, from menu costing to pre-opening execution. And we train staff on the floor, not just in a classroom.",
  missionProof:
    "Every engagement is measured on one question: did the numbers move? A training programme that does not reduce wastage has failed. A placement that does not last has failed. We would rather say no to work we cannot deliver than add another logo to a client list.",
  visionTitle:
    "To be the first call for hotel and restaurant owners across India and the Gulf — whether they are opening, hiring, fixing, or growing.",
  visionBody:
    "We want a hospitality sector in Kerala that no longer loses its best people by default, because the businesses here are strong enough to keep them. And we want Indian chefs and hospitality professionals to reach international kitchens through a route that is honest at both ends, with no false promises.",
  founder: "Biju Mohamed",
  yearsExperience: "Nearly 30 years",
  /**
   * CLIENT-SUPPLIED CLAIMS, not derived from any data source. Confirmed by the
   * client on 2026-11-20. They are public statements about the business, so
   * change them only on the client's instruction — never estimate or round
   * them up from the vacancy data, which only covers current live openings.
   */
  placements: "500+",
  countries: "30+",
} as const;

/* -------------------------------------------------------------------------- */
/*  Leadership + partnership copy                                             */
/* -------------------------------------------------------------------------- */

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  /**
   * Portrait, 4:5 portrait crop, served from /public.
   *
   * This currently points at a neutral branded placeholder, NOT a photograph
   * of the person — deliberately, because inventing a likeness for a named
   * real individual on a live business site is not something to ship. Drop the
   * real file in /public/images/team/ and change this one line.
   */
  photo: string;
}

/** Supplied by the client. Do not embellish these credentials. */
export const TEAM: TeamMember[] = [
  {
    name: "Biju Mohamed",
    role: "Director of Hospitality — Culinary and F&B Operations",
    bio:
      "Bringing 30 years of expertise in leading culinary and F&B operations across India and the Middle East, with recognised contributions featured in leading hospitality magazines.",
    photo: "/images/team/placeholder.png",
  },
];

/** The partnership close, in the company's own words. */
export const PARTNERSHIP = {
  eyebrow: "Partner with Innspireo",
  title: "Where hospitality meets growth",
  body:
    "At Innspireo Hospitality, we don't offer services — we build partnerships. Our mission is to help hotels, restaurants, cafés and resorts grow sustainably with expert-backed strategies, trained teams, strong systems and powerful branding.",
  closing:
    "Whether you are starting fresh or scaling up, we are here to elevate your entire hospitality journey.",
} as const;

export interface Reason {
  title: string;
  body: string;
}

/** "Why choose INNSPIRE?" — expanded from the corporate site's answer. */
export const WHY_CHOOSE: Reason[] = [
  {
    title: "One partner, not five vendors",
    body: "Full-spectrum solutions — recruiting talent, training teams, then branding, operations and profit growth. No more juggling vendors.",
  },
  {
    title: "Nearly three decades in hospitality",
    body: "We work only in hospitality. That is why our shortlists land and our operational advice survives contact with a live service.",
  },
  {
    title: "Measured on outcomes",
    body: "Every engagement is scored on whether the numbers moved. A training programme that does not reduce wastage has failed.",
  },
  {
    title: "Ethical recruitment",
    body: "Candidates are never charged a placement fee. Employer-funded recruitment keeps the people we place motivated and compliant.",
  },
  {
    title: "Global placement reach",
    body: "Permanent placements from India into the Gulf and Europe, with visa, documentation and mobilisation handled end to end.",
  },
  {
    title: "Owners as well as advisors",
    body: "We run our own branded hotels, restaurants and cafés — the advice we give operators is advice we take ourselves.",
  },
];

/* -------------------------------------------------------------------------- */
/*  About page copy — verbatim from innspireo.com                             */
/* -------------------------------------------------------------------------- */

/**
 * Taken word-for-word from /about-innspireo-hospitality-industry/. The only
 * change is British spelling for consistency with the rest of the site. Do not
 * paraphrase: the client supplied this as the copy they want used.
 */
export const ABOUT_COPY = {
  whoWeAre:
    "At Innspire Hospitality Industry, we are more than consultants — we are your dedicated partners in fuelling sustainable success across the hospitality industry. Based in Kochi, Kerala, and serving clients both locally and globally, we are a 360° hospitality solutions provider with nearly three decades of proven industry expertise. From boutique cafés to full-service hotels and large-scale events, we help businesses thrive with smart strategy, exceptional talent, and operational excellence.",
  keyServicesIntro:
    "Innspire Hospitality Management LLP delivers comprehensive hospitality services designed to elevate performance, streamline operations, and unlock long-term profitability. Our integrated suite includes:",
} as const;

/** The "Key Services & Reasons" list, in the client's own naming. */
export const KEY_SERVICES: string[] = [
  "Hospitality Recruitment & Talent Acquisition",
  "HR Consultancy & Statutory Compliance Services",
  "Staff Training & Development Programs",
  "End-to-End Project Setup & Launch Support",
  "Sales, Marketing & Digital Branding Solutions",
  "Revenue Turnaround & Profit Optimization",
  "Franchise, Management & Leasing Models",
  "Event Management & Catering Services",
];
