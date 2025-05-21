# **Catalyst by Experian – Implementation Plan**

## **Overview**

This document outlines the step-by-step implementation plan for building Catalyst by Experian. It’s structured to prioritize clarity, rapid prototyping, and stakeholder engagement—particularly for use in strategic workshops and foresight sessions.

## **Phase Breakdown**

### **Phase 0 – Planning & Scoping**

**Goal:** Finalize core scenarios and experience design.

* Define 3–5 strategic scenarios (e.g., Exclusivity Gambit, Equifax Pricing Shift)  
* Draft agent logic profiles for Experian, Equifax, and TransUnion  
* Work with stakeholders to confirm key outcomes to visualize (e.g., Risk Heatmap)  
* Sketch storyboard of user flow: scenario ➔ moves ➔ outcome

**Deliverables:**

* Scenario documents  
* Agent logic rules  
* UI flowcharts and visual references  
  ---

  ### **Phase 1 – Frontend Prototype**

**Goal:** Build the user interface for static simulation experience.

* Set up Next.js 14 project with Tailwind and shadcn/UI  
* Build Scenario Control Room with scenario tiles and CTA  
* Implement simulation dashboard shell:  
  * Node map (non-interactive)  
  * Timeline component  
  * Payoff signal cards (green/yellow/red)  
* Create perspective toggle UI (CRO, Regulator, Investor)

**Deliverables:**

* Responsive, desktop-first React interface  
* Static visual elements for node map and timelines  
  ---

  ### **Phase 2 – Agent Simulation Engine Integration**

**Goal:** Enable logic-driven move sequencing using agent-based modeling.

* Set up Python backend using Mesa framework  
* Define agents, incentives, and voting behaviors  
* Implement move sequences per scenario (round 1 → round 5\)  
* Connect simulation outcomes to frontend via lightweight API layer or mocked JSON

**Deliverables:**

* Functional simulation engine  
* Synced UI reactions based on agent responses  
* Example: trust fracture triggers animation \+ color shift  
  ---

  ### **Phase 3 – Outcome Brief Generator**

**Goal:** Deliver AI-style insights and visual summaries post-simulation.

* Build logic for summary brief:  
  * What happened  
  * Strategic implications  
  * Suggested next move  
* Create perspective-based overlays (Regulator vs CRO vs Investor)  
* Implement:  
  * Risk/Reward Heatmaps  
  * Strategic Action Matrix

**Deliverables:**

* Dynamic outcome brief module  
* Perspective toggles fully populated with summaries and overlays  
  ---

  ### **Phase 4 – Internal Demo & Testing**

**Goal:** Launch live in a workshop or executive test session.

* Run playtests with facilitators and strategy teams  
* Collect feedback on:  
  * Scenario accuracy  
  * Narrative clarity  
  * Visual impact  
* Refine payoff animations and agent logic based on feedback

**Deliverables:**

* Demo-ready version of Catalyst  
* Playtest insights and iteration plan  
  ---

  ## **Suggested Timeline (MVP First Launch)**

| Phase | Duration | Owner(s) |
| ----- | ----- | ----- |
| Phase 0 – Planning | 1–2 weeks | Strategy \+ Product |
| Phase 1 – UI Prototype | 2 weeks | Frontend Dev |
| Phase 2 – Simulation Logic | 2–3 weeks | Backend Dev (Python) |
| Phase 3 – Outcome Briefs | 1 week | UI \+ Strategy Lead |
| Phase 4 – Testing \+ Demo | 1 week | All Teams |

  ---

  ## **Team Roles & Setup**

* **Project Lead:** Oversees scenario development and stakeholder alignment  
* **Frontend Dev:** Next.js \+ Tailwind interface, animations, state management  
* **Backend Dev:** Mesa modeling, logic engine, mock API payloads  
* **Strategy Facilitator:** Designs scenarios and validates logic relevance  
* **Workshop Lead:** Runs live sessions and captures feedback  
  ---

  ## **Optional Integrations**

| Tool | Purpose | Notes |
| :---- | :---- | :---- |
| Vercel | Hosting \+ deploy previews | Works with Next.js out of the box |
| GitHub Actions | CI/CD for frontend \+ simulation code | Automate previews and builds |
| Loom/Figma | Storyboarding and internal demos | To review animations and flows |

  ---

  ## **Future-Ready Suggestions**

* Add export to PDF/Memo for outcome briefs  
* Scenario authoring interface for non-devs  
* Secure SSO login for extended enterprise use  
* Add support for 3rd-party agents (Fintech, Big Tech, Regulator)  
  ---

Catalyst’s MVP can be executed in \~6–8 weeks by a lean, focused team of 3–4 people with strong frontend and modeling experience. Its core power lies in storytelling, interactivity, and strategic clarity—not technical complexity.

