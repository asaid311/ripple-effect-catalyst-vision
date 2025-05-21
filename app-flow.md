# **Catalyst by Experian – App Flow, Pages & Roles**

## **Navigation Flow Summary**

Catalyst is a streamlined, no-login web simulation tool with a modular experience flow. It features a homepage hub (Scenario Control Room), a real-time simulation dashboard, and a post-simulation outcome brief.

All users access the same interface and toggle perspectives (CRO, Regulator, Investor) for different strategic interpretations—there are no persistent roles or accounts.

## **Key Pages & Components**

### **1\. Scenario Control Room (Homepage)**

**Purpose:** Entry point for simulation sessions

**Components:**

* Experian-branded dashboard layout  
* Scenario tiles (e.g., “The Exclusivity Gambit”, “The Silent Revolt”)  
* Scenario preview modal (briefing \+ agent context)  
* CTA: “Simulate Strategic Impact”  
* Perspective toggle: sets initial lens (CRO, Regulator, Investor)

**Actions:**

* Select scenario → move to dashboard  
* Choose initial lens (or default to CRO)

---

### **2\. Simulation Dashboard**

**Purpose:** Real-time modeling interface

**Components:**

* Node Map (visual layout of bureaus \+ roles)  
* Timeline of Moves (e.g., Proposal → Threat → Counteroffer)  
* Trust & Power Indicators (animated meters)  
* Move Input Panel (trigger next round)  
* Signal Cards (🟢🟡🔴 payoff indicators)  
* Regulatory Shock Sensor (if enabled)  
* Perspective Toggle (live-switch between CRO, Regulator, Investor)

**Actions:**

* Advance through predefined decision rounds  
* View signal effects on agent trust and system dynamics  
* Switch perspectives to view different summaries

---

### **3\. Outcome Brief / Simulation Summary**

**Purpose:** Display outcome and strategic recommendation

**Components:**

* Summary of all moves and reactions  
* Strategic Action Matrix (Impact × Probability)  
* Competitor Move Likelihood Heatmap  
* Suggested Experian Move  
* Risk vs. Gain Analysis (perspective-specific overlays)  
* Optional: Export or Save Brief (future roadmap)

**Actions:**

* Review final outcome based on all moves  
* Switch lens for summary interpretation

---

## **User Roles & Permissions**

### **No Account System – Open Sandbox**

* No authentication, no saved user state  
* All users share the same access  
* Used primarily in workshops or solo sessions

### **Lens Perspectives (Toggleable)**

* **Chief Revenue Officer (CRO):** Focused on revenue, partner leverage  
* **Chief Risk Officer (Risk):** Focused on trust, regulatory stability  
* **Regulator:** Concerned with systemic risk, consumer fairness, oversight readiness  
* **Investor (Optional):** Focused on market perception and partner alliances

These lenses alter the framing and language of payoff signals and summary briefs—but not the simulation logic itself.

---

## **Flow Summary Diagram**

```
[Scenario Control Room]
      |
      v
[Simulation Dashboard] ←→ [Perspective Toggle]
      |
      v
[Outcome Brief Summary] ←→ [Perspective Toggle]
```

---

## **Navigation & Interactivity Highlights**

* All flows are **one-session scoped** — simulations reset when reloaded  
* Smooth transitions between rounds and summary views  
* Clicks and toggles emphasize narrative pacing, not data entry

---

Catalyst’s app flow is designed for **clarity, speed, and dramatic insight**—supporting both guided workshops and self-directed strategic play.

