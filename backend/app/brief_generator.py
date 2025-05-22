import pandas as pd

DEFAULT_PERSPECTIVE = "CRO" # Chief Risk Officer / Company perspective

def generate_brief(scenario_id: str, model_df: pd.DataFrame, agent_df: pd.DataFrame, perspective: str = DEFAULT_PERSPECTIVE) -> dict:
    """
    Generates a summary brief based on the simulation data and perspective.
    """
    brief = {
        "scenario_id": scenario_id,
        "perspective": perspective, # Add perspective to the brief itself
        "summary": {
            "what_happened": [], # Objective facts
            "strategic_implications": [], # Perspective-dependent
            "suggested_next_move": "No specific suggestion generated for this scenario or perspective yet." # Perspective-dependent
        }
    }
    # Rename "suggested_next_move_experian" to "suggested_next_move" for generality

    agent_data_by_step = {}
    if not agent_df.empty:
        for step, group in agent_df.groupby('Step'):
            agent_data_by_step[step] = group.to_dict(orient='records')

    # Common data extraction - this can be used by all perspectives for context
    all_agents_final_states = {}
    if not agent_df.empty:
        for name, group in agent_df.groupby('Name'):
            all_agents_final_states[name] = group.iloc[-1].to_dict()
    
    experian_final_state = all_agents_final_states.get('Experian')


    if scenario_id == "exclusivity_gambit":
        generate_exclusivity_gambit_brief(brief, model_df, agent_data_by_step, experian_final_state, all_agents_final_states, perspective)
    elif scenario_id == "data_breach_response":
        generate_data_breach_response_brief(brief, model_df, agent_data_by_step, experian_final_state, all_agents_final_states, perspective)
    elif scenario_id == "new_entrant_alliance":
        generate_new_entrant_alliance_brief(brief, model_df, agent_data_by_step, experian_final_state, all_agents_final_states, perspective)
    else:
        brief["summary"]["what_happened"].append("Brief generation for this scenario is not yet implemented.")
        brief["summary"]["strategic_implications"].append(f"No specific implications for perspective '{perspective}'.")
        brief["summary"]["suggested_next_move"] = f"No specific suggestions for perspective '{perspective}'."


    # If no specific suggestion was set by scenario handlers, provide a generic one.
    if brief["summary"]["suggested_next_move"] == "No specific suggestion generated for this scenario or perspective yet.":
        if perspective == "CRO":
             brief["summary"]["suggested_next_move"] = "Continuously monitor market dynamics, adapt strategies to maintain competitive advantage, and ensure operational resilience."
        elif perspective == "Regulator":
            brief["summary"]["suggested_next_move"] = "Ensure market practices remain fair and transparent. Monitor for anti-competitive behavior and systemic risks. Promote data security standards."
        elif perspective == "Investor":
            brief["summary"]["suggested_next_move"] = "Evaluate the company's strategic positioning, risk management, and long-term value creation potential in light of these events."


    return brief


def generate_exclusivity_gambit_brief(brief: dict, model_df: pd.DataFrame, agent_data_by_step: dict, experian_final_state, all_agents_final_states, perspective: str):
    """Generates brief for the 'Exclusivity Gambit' scenario."""
    wh = brief["summary"]["what_happened"] # Objective facts, largely perspective-agnostic
    si = brief["summary"]["strategic_implications"] # Perspective-dependent
    # Suggested next move will be directly assigned to brief["summary"]["suggested_next_move"]
    
    competitor_reactions = []
    deal_outcome = "not explicitly tracked in model_df" # Default
    initial_market_shares = {} # Store initial market shares for all agents
    final_market_shares = {}   # Store final market shares for all agents

    # --- What Happened (Objective) ---
    # This section remains largely the same, focusing on factual outcomes.
    for step, agents_in_step in sorted(agent_data_by_step.items()):
        round_num = step 
        for agent_state in agents_in_step:
            agent_name = agent_state['Name']
            # Capture initial market shares at Round 1 for all agents
            if round_num == 1:
                initial_market_shares[agent_name] = agent_state['MarketShare']

            if round_num == 1 and agent_name == 'Experian' and agent_state['Vote'] == 'propose_exclusivity':
                wh.append(f"Round 1: Experian (incentive: {agent_state['CurrentIncentive']}) proposed an exclusivity deal.")
            
            if round_num == 2 and agent_name != 'Experian':
                if agent_state['Vote'] in ['counter_offer_exclusivity', 'undermine_experian_deal']:
                    competitor_reactions.append(f"{agent_name} reacted by '{agent_state['Vote']}' (incentive: {agent_state['CurrentIncentive']}).")
            
            # Capture final market shares at the last round for all agents
            if round_num == model_df['CurrentRound'].max():
                 final_market_shares[agent_name] = agent_state['MarketShare']

    if competitor_reactions:
        wh.append(f"Round 2: Competitors reacted. For example, {competitor_reactions[0] if competitor_reactions else 'some reactions occurred.'}")

    if 'ExclusivityDealSecured' in model_df.columns:
        final_deal_status = model_df['ExclusivityDealSecured'].iloc[-1]
        if final_deal_status is True:
            deal_outcome = "Experian's exclusivity deal was accepted."
            wh.append(f"Outcome: {deal_outcome}")
        elif final_deal_status is False:
            deal_outcome = "Experian's exclusivity deal was rejected or failed."
            wh.append(f"Outcome: {deal_outcome}")
        else:
            deal_outcome = "The outcome of Experian's deal was undecided."
            wh.append(f"Outcome: {deal_outcome}")
    
    market_share_changes_summary = []
    for name, final_share in final_market_shares.items():
        initial_share = initial_market_shares.get(name, final_share) 
        change = (final_share - initial_share) * 100
        if abs(change) > 0.1:
             market_share_changes_summary.append(f"{name}'s market share changed by {change:.1f}% (to {final_share*100:.1f}%).")
    
    if market_share_changes_summary:
        wh.append(f"Market Impact: {', '.join(market_share_changes_summary)}")
    else:
        wh.append("Market Impact: No significant market share changes were observed among the major players.")

    # --- Perspective-based Implications and Suggestions ---
    # CRO Perspective (Experian's CRO)
    if perspective == "CRO":
        if deal_outcome == "Experian's exclusivity deal was accepted.":
            si.append("Successful execution of an aggressive exclusivity strategy can significantly boost market share and competitive positioning.")
            si.append("Increased market share may attract competitor retaliation and heightened regulatory scrutiny; risk mitigation plans are essential.")
            if experian_final_state and experian_final_state['MarketShare'] > 0.4:
                brief["summary"]["suggested_next_move"] = "Focus on integrating the exclusive data to maximize value and solidify customer relationships. Develop strategies to defend against competitor responses and manage regulatory expectations."
            else:
                brief["summary"]["suggested_next_move"] = "Leverage the successful deal to pursue further strategic partnerships and expand market reach. Monitor competitor reactions and adapt strategy accordingly."
        else: # Deal failed or undecided
            si.append("Failure to secure an exclusivity deal indicates potential misjudgment of market conditions or competitive responses. This can impact resource allocation and morale.")
            si.append("Competitors may perceive this as a weakness, potentially leading to more aggressive counter-moves.")
            brief["summary"]["suggested_next_move"] = "Conduct a thorough post-mortem of the failed gambit to identify key learnings. Strengthen core offerings and rebuild strategic capital before attempting similar high-risk maneuvers. Explore alternative growth avenues such as organic innovation or smaller-scale alliances."

    # Regulator Perspective
    elif perspective == "Regulator":
        if deal_outcome == "Experian's exclusivity deal was accepted.":
            si.append("Experian's successful exclusivity deal has led to a notable increase in its market share, potentially reducing competition in the credit reporting market.")
            si.append("Such market concentration could lead to higher prices, reduced innovation, or unfair consumer data practices if not monitored.")
            brief["summary"]["suggested_next_move"] = "Increase scrutiny on Experian's market conduct and data handling post-deal. Assess the impact on smaller competitors and overall market fairness. Consider guidelines for data exclusivity to prevent anti-competitive outcomes."
        else: # Deal failed or undecided
            si.append("The failure of Experian's exclusivity gambit suggests that competitive forces or existing regulations may be sufficient to prevent excessive market concentration via such means for now.")
            si.append("However, the intent to pursue such a strategy warrants ongoing monitoring of market dynamics and data access practices.")
            brief["summary"]["suggested_next_move"] = "Continue to monitor the competitive landscape for attempts at data monopolization. Reinforce principles of fair data access and pro-competitive practices within the industry."
            
    # Investor Perspective
    elif perspective == "Investor":
        experian_market_share_final = final_market_shares.get("Experian", 0)
        experian_market_share_initial = initial_market_shares.get("Experian", 0)
        market_share_gain = (experian_market_share_final - experian_market_share_initial) * 100

        if deal_outcome == "Experian's exclusivity deal was accepted.":
            si.append(f"Experian's successful gambit demonstrates aggressive growth intent and ability to execute, resulting in a {market_share_gain:.1f}% market share increase. This could signal higher future revenues but also increased risk.")
            si.append("The strategy's success might invite stronger competition or regulatory challenges, affecting long-term sustainability.")
            brief["summary"]["suggested_next_move"] = f"Assess the premium associated with Experian's increased market share ({experian_market_share_final*100:.1f}%) against potential integration risks and future competitive/regulatory pressures. Consider the long-term impact on profitability and market stability."
        else: # Deal failed or undecided
            si.append(f"Experian's failed exclusivity attempt (market share change: {market_share_gain:.1f}%) may indicate execution risks or an overestimation of its market power. This could impact investor confidence in strategic growth initiatives.")
            si.append("The market remains competitive, and Experian may need to find alternative, possibly less risky, pathways for growth.")
            brief["summary"]["suggested_next_move"] = "Evaluate Experian's strategic planning and risk management capabilities. Monitor for revised growth strategies and their potential impact on future earnings and market position. Diversification of growth drivers may be viewed favorably."
    else: # Default or unknown perspective
        si.append("Exclusivity deals are high-risk, high-reward maneuvers that can significantly alter market dynamics.")
        brief["summary"]["suggested_next_move"] = "Generic Suggestion: Analyze the outcome and adapt strategies accordingly."


def generate_data_breach_response_brief(brief: dict, model_df: pd.DataFrame, agent_data_by_step: dict, experian_final_state, all_agents_final_states, perspective: str):
    """Generates brief for the 'Data Breach Response' scenario."""
    wh = brief["summary"]["what_happened"] # Objective
    si = brief["summary"]["strategic_implications"] # Perspective-dependent

    breached_agent_name = "Unknown"
    breached_agent_initial_trust = -1
    breached_agent_final_trust = -1
    
    initial_market_shares = {}
    final_market_shares = {}
    competitor_opportunism = {} # Tracks if competitors (like Experian) acted opportunistically

    round_of_breach = 0
    # --- What Happened (Objective) ---
    for step, agents_in_step in sorted(agent_data_by_step.items()):
        round_num = step
        for agent_state in agents_in_step:
            agent_name = agent_state['Name']
            if round_num == 1:
                initial_market_shares[agent_name] = agent_state['MarketShare']
            if round_num == model_df['CurrentRound'].max():
                final_market_shares[agent_name] = agent_state['MarketShare']

            if agent_state['CurrentIncentive'] == 'damage_control' and round_of_breach == 0:
                breached_agent_name = agent_name
                round_of_breach = round_num
                breached_agent_initial_trust = agent_state['TrustLevel']
                wh.append(f"Round {round_of_breach}: {breached_agent_name} acknowledged a data breach, shifting to 'damage_control' (Trust: {breached_agent_initial_trust:.2f}).")
            
            if agent_name == breached_agent_name and agent_state['CurrentIncentive'] == 'rebuild_trust':
                breached_agent_final_trust = agent_state['TrustLevel']

            if agent_name != breached_agent_name and round_of_breach > 0 and round_num > round_of_breach:
                if agent_state['CurrentIncentive'] == 'opportunistic_growth' or agent_state['Vote'] == 'exploit_competitor_weakness':
                    competitor_opportunism[agent_name] = True
    
    if breached_agent_name == "Unknown": # Should ideally get from model.scenario_states if possible
        wh.append("A data breach occurred; specific agent not identified from behavioral data alone.")
    else:
        if breached_agent_final_trust == -1 : breached_agent_final_trust = all_agents_final_states.get(breached_agent_name, {}).get('TrustLevel', breached_agent_initial_trust)
        wh.append(f"{breached_agent_name} initiated recovery, with trust moving from ~{breached_agent_initial_trust:.2f} to ~{breached_agent_final_trust:.2f}.")

    market_share_changes_summary = []
    for name, final_share in final_market_shares.items():
        initial_share = initial_market_shares.get(name, final_share)
        change = (final_share - initial_share) * 100
        if abs(change) > 0.1:
             market_share_changes_summary.append(f"{name} market share change: {change:.1f}% (to {final_share*100:.1f}%)")
    if market_share_changes_summary: wh.append("Market Impact: " + ", ".join(market_share_changes_summary))
    
    opportunistic_moves = [name for name, acted in competitor_opportunism.items() if acted]
    if opportunistic_moves: wh.append(f"Competitors like {', '.join(opportunistic_moves)} exhibited opportunistic behavior.")

    # --- Perspective-based Implications and Suggestions ---
    breached_agent_final_market_share = final_market_shares.get(breached_agent_name, 0)
    experian_final_market_share = final_market_shares.get("Experian", 0)
    experian_initial_market_share = initial_market_shares.get("Experian", 0)

    if perspective == "CRO":
        si.append(f"A data breach at {breached_agent_name} significantly impacted its trust and market share ({breached_agent_final_market_share*100:.1f}% final). This highlights critical operational risks.")
        si.append("Competitor responses, including opportunistic strategies, can swiftly alter market dynamics during such crises.")
        if breached_agent_name == 'Experian':
            brief["summary"]["suggested_next_move"] = "Intensify efforts to rebuild customer trust and regulatory confidence. Focus on transparent communication, robust security enhancements, and customer support. Evaluate and mitigate future operational risks."
        else:
            experian_gain = (experian_final_market_share - experian_initial_market_share) * 100
            if experian_gain > 1:
                brief["summary"]["suggested_next_move"] = f"Capitalize on the {experian_gain:.1f}% market share gain by reinforcing Experian's security posture and reliability to attract disillusioned customers from {breached_agent_name}. However, balance aggression with maintaining overall market stability."
            else:
                brief["summary"]["suggested_next_move"] = f"Emphasize Experian's data security and stability to differentiate from {breached_agent_name}. Proactively reassure clients and partners. Be prepared for shifts in customer preferences towards more secure providers."

    elif perspective == "Regulator":
        si.append(f"The data breach at {breached_agent_name} underscores systemic vulnerabilities in consumer data protection within the credit reporting industry.")
        si.append(f"Market share shifts post-breach (e.g., {breached_agent_name} to {breached_agent_final_market_share*100:.1f}%) could indicate instability or predatory practices by competitors if not managed.")
        brief["summary"]["suggested_next_move"] = f"Investigate the root causes and adequacy of {breached_agent_name}'s response to the breach. Review industry-wide data security standards and enforcement. Monitor competitors for any anti-competitive behavior aimed at exploiting the situation."
    
    elif perspective == "Investor":
        si.append(f"The data breach at {breached_agent_name} represents a significant operational failure, materially impacting its brand value, customer trust, and market share ({breached_agent_final_market_share*100:.1f}%).")
        si.append(f"The event's impact on {breached_agent_name}'s stock and long-term profitability could be substantial. Competitors' ability to capitalize also affects their valuation.")
        if breached_agent_name == 'Experian':
            brief["summary"]["suggested_next_move"] = f"Critically assess Experian's crisis management, long-term recovery plan, and future investments in security. Quantify the financial impact of the breach and the cost of remediation. Re-evaluate risk exposure."
        else:
            experian_gain = (experian_final_market_share - experian_initial_market_share) * 100
            brief["summary"]["suggested_next_move"] = f"Evaluate the net positive impact for Experian (market share gain of {experian_gain:.1f}%) against any increased systemic risk or negative sentiment towards the industry. Assess if Experian's current valuation reflects its relative stability or opportunistic gains."


def generate_new_entrant_alliance_brief(brief: dict, model_df: pd.DataFrame, agent_data_by_step: dict, experian_final_state, all_agents_final_states, perspective: str):
    """Generates brief for the 'New Entrant Alliance' scenario."""
    wh = brief["summary"]["what_happened"] # Objective
    si = brief["summary"]["strategic_implications"] # Perspective-dependent

    alliance_target_name = "Unknown"
    alliance_formed = False
    
    initial_market_shares = {}
    final_market_shares = {}

    # --- What Happened (Objective) ---
    for step, agents_in_step in sorted(agent_data_by_step.items()):
        round_num = step
        for agent_state in agents_in_step:
            agent_name = agent_state['Name']
            if round_num == 1: initial_market_shares[agent_name] = agent_state['MarketShare']
            if round_num == model_df['CurrentRound'].max(): final_market_shares[agent_name] = agent_state['MarketShare']

            if agent_state['CurrentIncentive'] == 'strategic_partnership_assessment':
                alliance_target_name = agent_state['Name']
                wh.append(f"Round {round_num}: {alliance_target_name} (incentive: {agent_state['CurrentIncentive']}) assessed a potential alliance with new entrant 'FinDataInnovate'.")
            if agent_state['Name'] == alliance_target_name and agent_state['Vote'] == 'accept_alliance_proposal':
                alliance_formed = True
    
    if alliance_target_name == "Unknown": wh.append("A new entrant, 'FinDataInnovate', explored alliances, but no specific incumbent target was clearly identified from behavioral data.")
    
    if alliance_formed:
        wh.append(f"Outcome: {alliance_target_name} accepted the alliance with 'FinDataInnovate'.")
    elif alliance_target_name != "Unknown":
        wh.append(f"Outcome: {alliance_target_name} rejected or did not proceed with the alliance.")
    else:
        wh.append("Outcome: The new entrant's alliance proposal did not materialize with any major player.")

    market_share_changes_summary = []
    if alliance_formed and alliance_target_name != "Unknown":
        target_initial_share = initial_market_shares.get(alliance_target_name, 0)
        target_final_share = final_market_shares.get(alliance_target_name, 0)
        change = (target_final_share - target_initial_share) * 100
        if abs(change) > 0.1:
            market_share_changes_summary.append(f"{alliance_target_name} (formed alliance) market share changed by {change:.1f}% to {target_final_share*100:.1f}%.")
    
    # Check Experian's share change regardless of its role as target
    experian_initial = initial_market_shares.get("Experian",0)
    experian_final = final_market_shares.get("Experian",0)
    experian_change = (experian_final - experian_initial) * 100
    if abs(experian_change) > 0.1 and alliance_target_name != "Experian": # Avoid double reporting if Experian was target
         market_share_changes_summary.append(f"Experian's market share changed by {experian_change:.1f}% to {experian_final*100:.1f}%.")

    if market_share_changes_summary: wh.append("Market Impact: " + ", ".join(market_share_changes_summary))


    # --- Perspective-based Implications and Suggestions ---
    if perspective == "CRO":
        if alliance_target_name == 'Experian' and alliance_formed:
            si.append("Successfully forming an alliance with an innovator like 'FinDataInnovate' can enhance Experian's capabilities, market reach, and competitive edge.")
            brief["summary"]["suggested_next_move"] = "Focus on seamless integration of 'FinDataInnovate'. Leverage combined strengths for new product development and market penetration. Monitor for competitor counter-alliances."
        elif alliance_formed: # Competitor formed alliance
            si.append(f"The alliance between {alliance_target_name} and 'FinDataInnovate' could create a stronger competitor, potentially threatening Experian's market share or access to innovation.")
            brief["summary"]["suggested_next_move"] = f"Analyze the capabilities of the {alliance_target_name}-FinDataInnovate alliance. Expedite internal innovation efforts or identify alternative strategic partners for Experian to counter this new bloc."
        else: # No major alliance formed
            si.append("The failure of 'FinDataInnovate' to form a major alliance indicates either high incumbent defensiveness or weaknesses in the entrant's proposition. The competitive landscape remains largely unchanged by this specific threat for now.")
            brief["summary"]["suggested_next_move"] = "Maintain vigilance for other emerging fintechs or disruptive technologies. Continue to strengthen Experian's value proposition to deter new entrants and explore selective, high-value partnerships."

    elif perspective == "Regulator":
        if alliance_formed:
            si.append(f"The alliance between {alliance_target_name} and 'FinDataInnovate' could introduce new services or improve competition, which may benefit consumers if properly managed.")
            si.append(f"However, such alliances also need monitoring to ensure they don't lead to data siloing, unfair competitive advantages, or new forms of systemic risk if the new entrant's technology is unproven.")
            brief["summary"]["suggested_next_move"] = f"Review the terms and potential market impact of the {alliance_target_name}-FinDataInnovate alliance. Ensure data sharing and operational practices comply with existing regulations and promote fair competition. Assess any new risks introduced by the new entrant's technology."
        else:
            si.append("The inability of a new entrant to form a significant alliance may suggest high barriers to entry in the credit reporting market, potentially limiting innovation and competition.")
            brief["summary"]["suggested_next_move"] = "Evaluate policies related to new entrants and data access to ensure they foster innovation while maintaining market stability and consumer protection. Monitor incumbents for practices that might stifle new competition."

    elif perspective == "Investor":
        if alliance_target_name == 'Experian' and alliance_formed:
            si.append("Experian's alliance with 'FinDataInnovate' could unlock new revenue streams and enhance its technological capabilities, potentially leading to a higher valuation if executed well.")
            si.append("Integration risks and the actual ROI from the alliance need to be carefully monitored.")
            brief["summary"]["suggested_next_move"] = "Assess the financial projections and strategic fit of the 'FinDataInnovate' alliance for Experian. Monitor key performance indicators related to the alliance's success and its impact on Experian's overall growth and profitability."
        elif alliance_formed: # Competitor formed alliance
            si.append(f"The {alliance_target_name}-'FinDataInnovate' alliance creates a more formidable competitor, which could impact Experian's growth prospects and profitability if Experian fails to respond effectively.")
            brief["summary"]["suggested_next_move"] = f"Evaluate Experian's competitive response strategy to the {alliance_target_name}-'FinDataInnovate' tie-up. Assess potential impacts on Experian's market share and margins. Consider if Experian needs a similar strategic move to maintain its investment appeal."
        else: # No major alliance formed
            si.append("The failure of 'FinDataInnovate' to secure a major alliance suggests the market's competitive moat is strong, or the entrant's value was not compelling enough. This could mean stability for incumbents like Experian in the short term.")
            brief["summary"]["suggested_next_move"] = "Reaffirm Experian's current market positioning and organic growth strategy. However, remain watchful for future disruptive threats or more successful new entrants that could alter the investment thesis for Experian."


# Example Usage (for testing this module directly):
if __name__ == '__main__':
    # --- Test Exclusivity Gambit ---
    print("\n--- TESTING EXCLUSIVITY GAMBIT ---")
    model_data_ex = pd.DataFrame({
        'CurrentRound': [1, 2, 3, 4, 5],
        'CurrentScenario': ['exclusivity_gambit'] * 5,
        'ExclusivityDealSecured': [None, None, True, True, True] # Deal secured in round 3
    })
    agent_data_ex = pd.DataFrame({
        'Step': [1,1,1, 2,2,2, 3,3,3, 4,4,4, 5,5,5], # 3 agents, 5 steps
        'Name': ['Experian', 'Equifax', 'TransUnion'] * 5,
        'Vote': ['propose_exclusivity',None,None, None,'counter_offer_exclusivity',None, None,None,None, None,None,None, None,None,None],
        'CurrentIncentive': ['market_share_dominance'] + ['market_share_expansion']*2 + \
                            ['market_share_dominance'] + ['compete_aggressively']*2 + \
                            ['market_share_dominance'] + ['compete_aggressively']*2 + \
                            ['market_share_dominance'] + ['compete_aggressively']*2 + \
                            ['profit_maximization'] + ['market_share_expansion']*2,
        'MarketShare': [0.33,0.33,0.33, 0.33,0.33,0.33, 0.40,0.30,0.30, 0.42,0.29,0.29, 0.45,0.28,0.27],
        'TrustLevel': [0.5]*3*5 # Simplified
    })
    import json
    for p in ["CRO", "Regulator", "Investor"]:
        print(f"\n--- Perspective: {p} ---")
        brief_output = generate_brief("exclusivity_gambit", model_data_ex, agent_data_ex, perspective=p)
        print(json.dumps(brief_output, indent=2))

    # --- Test Data Breach ---
    print("\n\n--- TESTING DATA BREACH ---")
    model_data_db = pd.DataFrame({
        'CurrentRound': [1, 2, 3, 4, 5],
        'CurrentScenario': ['data_breach_response'] * 5,
    })
    agent_data_db = pd.DataFrame({
        'Step':             [1,1,1,  2,2,2,  3,3,3,  4,4,4,  5,5,5],
        'Name':             ['Experian', 'Equifax', 'TransUnion'] * 5, # Equifax is breached
        'CurrentIncentive': ['profit_maximization','damage_control','data_security_focus', #R1 Equifax breached
                             'opportunistic_growth','damage_control','data_security_focus', #R2 Exp opportunistic
                             'opportunistic_growth','rebuild_trust','data_security_focus',  #R3 Equifax rebuilding
                             'profit_maximization','rebuild_trust','data_security_focus',
                             'profit_maximization','rebuild_trust','data_security_focus'],
        'MarketShare':      [0.33,0.33,0.33,  0.35,0.30,0.33,  0.37,0.28,0.33,  0.38,0.27,0.33,  0.38,0.27,0.33], # Equifax loses, Exp gains
        'TrustLevel':       [0.5,0.2,0.5,  0.52,0.25,0.5,  0.53,0.3,0.5,  0.53,0.32,0.5,  0.53,0.35,0.5], # Equifax trust recovers slowly
        'Vote':             [None]*3*5 # Simplified
    })
    for p in ["CRO", "Regulator", "Investor"]:
        print(f"\n--- Perspective: {p} ---")
        brief_output = generate_brief("data_breach_response", model_data_db, agent_data_db, perspective=p)
        print(json.dumps(brief_output, indent=2))

    # --- Test New Entrant Alliance ---
    print("\n\n--- TESTING NEW ENTRANT ALLIANCE ---")
    # Case 1: Experian forms alliance
    model_data_ne_exp = pd.DataFrame({'CurrentRound': [1,2,3,4,5], 'CurrentScenario': ['new_entrant_alliance']*5})
    agent_data_ne_exp = pd.DataFrame({
        'Step':             [1,1,1,  2,2,2,  3,3,3,  4,4,4,  5,5,5],
        'Name':             ['Experian', 'Equifax', 'TransUnion'] * 5,
        'CurrentIncentive': ['strategic_partnership_assessment','market_share_expansion','data_security_focus', #R1 Exp assesses
                             'profit_maximization','competitive_response_to_alliance','competitive_response_to_alliance', #R2 Others react
                             'profit_maximization','market_share_expansion','data_security_focus',
                             'profit_maximization','market_share_expansion','data_security_focus',
                             'profit_maximization','market_share_expansion','data_security_focus'],
        'MarketShare':      [0.33,0.33,0.33,  0.38,0.31,0.31,  0.40,0.30,0.30,  0.41,0.295,0.295,  0.42,0.29,0.29], # Exp gains
        'TrustLevel':       [0.55,0.5,0.5,  0.55,0.48,0.48,  0.55,0.48,0.48,  0.55,0.48,0.48,  0.55,0.48,0.48],
        'Vote':             ['accept_alliance_proposal',None,None, None,None,None, None,None,None, None,None,None, None,None,None] # Exp accepts
    })
    for p in ["CRO", "Regulator", "Investor"]:
        print(f"\n--- Perspective: {p} (Experian forms alliance) ---")
        brief_output = generate_brief("new_entrant_alliance", model_data_ne_exp, agent_data_ne_exp, perspective=p)
        print(json.dumps(brief_output, indent=2))

    # Case 2: Equifax forms alliance
    agent_data_ne_eq = pd.DataFrame({
        'Step':             [1,1,1,  2,2,2,  3,3,3,  4,4,4,  5,5,5],
        'Name':             ['Experian', 'Equifax', 'TransUnion'] * 5,
        'CurrentIncentive': ['profit_maximization','strategic_partnership_assessment','data_security_focus', #R1 Eq assesses
                             'competitive_response_to_alliance','profit_maximization','competitive_response_to_alliance', #R2 Others react
                             'profit_maximization','profit_maximization','data_security_focus',
                             'profit_maximization','profit_maximization','data_security_focus',
                             'profit_maximization','profit_maximization','data_security_focus'],
        'MarketShare':      [0.33,0.33,0.33,  0.31,0.38,0.31,  0.30,0.40,0.30,  0.295,0.41,0.295,  0.29,0.42,0.29], # Eq gains
        'TrustLevel':       [0.5,0.55,0.5,  0.48,0.55,0.48,  0.48,0.55,0.48,  0.48,0.55,0.48,  0.48,0.55,0.48],
        'Vote':             [None,'accept_alliance_proposal',None, None,None,None, None,None,None, None,None,None, None,None,None] # Eq accepts
    })
    for p in ["CRO", "Regulator", "Investor"]:
        print(f"\n--- Perspective: {p} (Equifax forms alliance) ---")
        brief_output = generate_brief("new_entrant_alliance", model_data_ne_exp, agent_data_ne_eq, perspective=p) # model_df can be generic for this test
        print(json.dumps(brief_output, indent=2))
