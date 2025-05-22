from mesa import Agent

class CreditBureauAgent(Agent):
    """Base class for credit bureau agents."""
    def __init__(self, unique_id, model, name, initial_incentive):
        super().__init__(unique_id, model)
        self.name = name
        self.initial_incentive = initial_incentive
        self.current_incentive = initial_incentive # Incentive can change based on scenario
        self.trust_level = 0.5  # Initial trust level (0.0 to 1.0) towards the system/other agents
        self.vote = None  # To store the agent's vote on a proposal
        self.scenario_data = {} # To store scenario-specific attributes for the agent
        self.market_share = 1/3 # Initial market share, assuming 3 major players

    def step(self):
        """Agent's action during a simulation step, potentially influenced by the current scenario."""
        if self.model.current_scenario:
            self.execute_scenario_step()
        else:
            # Default behavior if no specific scenario is active
            self.default_behavior()

    def default_behavior(self):
        """Default agent behavior when no specific scenario is active."""
        # Basic voting behavior (can be expanded)
        if self.trust_level > 0.6:
            self.vote = "yes" # Example: vote yes on a generic proposal
        elif self.trust_level < 0.4:
            self.vote = "no"
        else:
            self.vote = self.random.choice(["yes", "no", "abstain"])
        print(f"{self.name} (Trust: {self.trust_level:.2f}) votes: {self.vote} (Incentive: {self.current_incentive}) - Default Behavior")

    def execute_scenario_step(self):
        """Executes scenario-specific logic for the agent."""
        # This method will be called by the model's step function
        # and will delegate to specific scenario handlers.
        # For now, it's a placeholder.
        # The actual logic will be more detailed in the model's scenario handling.
        scenario_name = self.model.current_scenario
        handler_method_name = f"handle_{scenario_name}_step"
        handler_method = getattr(self, handler_method_name, self.default_scenario_behavior)
        handler_method()

    def default_scenario_behavior(self):
        """Default behavior if a scenario is active but no specific handler is defined for the agent."""
        print(f"{self.name} has no specific action for round {self.model.current_round} of {self.model.current_scenario}. Performing default action.")
        self.default_behavior()

    def adjust_trust(self, target_agent_name, change):
        """Adjusts this agent's trust towards a target agent, or system if target_agent_name is None."""
        # This is a simplified model. In reality, trust is pairwise.
        # For now, we'll use a single trust_level attribute representing general trust.
        # A more complex model would have a dictionary like self.trust_towards_others = {"Experian": 0.5, ...}
        self.trust_level += change
        self.trust_level = max(0, min(1, self.trust_level)) # General trust level
        print(f"General trust level of {self.name} adjusted by {change:.2f} to {self.trust_level:.2f} due to interaction regarding {target_agent_name if target_agent_name else 'the system'}")

    def update_incentive(self, new_incentive):
        self.current_incentive = new_incentive
        print(f"{self.name}'s incentive changed to: {self.current_incentive}")

    # --- Scenario-specific handlers to be called by execute_scenario_step ---

    def handle_exclusivity_gambit_step(self):
        """Handles agent actions for the 'Exclusivity Gambit' scenario."""
        round_num = self.model.current_round
        # Experian leads, others react
        if self.name == "Experian":
            if round_num == 1:
                self.vote = "propose_exclusivity" # Experian's move
                self.update_incentive("market_share_dominance")
                print(f"{self.name} (Round {round_num}): Proposes exclusivity deal. Incentive: {self.current_incentive}")
            elif round_num == 3: # Assuming client decision happens, Experian reacts
                # Placeholder for reacting to client decision
                if self.scenario_data.get("exclusivity_deal_secured", False):
                    print(f"{self.name} (Round {round_num}): Exclusivity deal secured! Market share increases.")
                    self.market_share += 0.1 # Example increase
                else:
                    print(f"{self.name} (Round {round_num}): Exclusivity deal failed.")
        else: # Equifax & TransUnion
            if round_num == 2:
                self.update_incentive("compete_aggressively")
                # React to Experian's proposal: try to counter or undermine
                if self.trust_level > 0.4: # If still somewhat trusting, might try a direct counter
                    self.vote = "counter_offer_exclusivity"
                else: # If less trusting, might try to undermine
                    self.vote = "undermine_experian_deal"
                print(f"{self.name} (Round {round_num}): Reacts to Experian's gambit with '{self.vote}'. Incentive: {self.current_incentive}")
            elif round_num == 3: # React to client's decision
                 if not self.model.scenario_states.get("exclusivity_gambit", {}).get("deal_secured_by_experian", False):
                    print(f"{self.name} (Round {round_num}): Experian's deal failed. Opportunity for us.")
                    self.market_share += 0.02 # Small gain from Experian's failure


    def handle_data_breach_response_step(self):
        """Handles agent actions for the 'Data Breach Response' scenario."""
        round_num = self.model.current_round
        breached_agent_name = self.model.scenario_states.get("data_breach_response", {}).get("breached_agent")

        if self.name == breached_agent_name:
            if round_num == 1: # Breach discovered
                self.update_incentive("damage_control")
                self.adjust_trust(None, -0.5) # Significant self-trust drop / public trust
                self.vote = "acknowledge_breach"
                print(f"{self.name} (Round {round_num}): Data breach acknowledged. Trust plummets. Incentive: {self.current_incentive}")
                self.market_share -= 0.1 # Initial market share loss
            elif round_num == 2: # Mitigation efforts
                self.vote = "implement_security_measures"
                print(f"{self.name} (Round {round_num}): Implementing enhanced security measures.")
            elif round_num >= 3: # Rebuilding trust phase
                 self.update_incentive("rebuild_trust")
                 # Gradually regain trust if successful
                 self.adjust_trust(None, 0.05)
                 print(f"{self.name} (Round {round_num}): Attempting to rebuild trust. Incentive: {self.current_incentive}")

        else: # Other agents
            if round_num == 1: # News of breach
                # Decide whether to be opportunistic or show solidarity
                if self.current_incentive == "profit_maximization": # More likely to be opportunistic
                     self.update_incentive("opportunistic_growth")
                     self.vote = "exploit_competitor_weakness"
                else:
                     self.update_incentive("industry_solidarity")
                     self.vote = "offer_support_to_breached_agent"
                # Trust in the breached agent drops
                # This needs a mechanism to target another agent's perceived trust,
                # For now, this reflects general caution in the system.
                print(f"{self.name} (Round {round_num}): Reacts to {breached_agent_name}'s breach with '{self.vote}'. Incentive: {self.current_incentive}")
            elif round_num >=2:
                if self.current_incentive == "opportunistic_growth":
                    self.market_share += 0.03 # Try to gain market share
                    print(f"{self.name} (Round {round_num}): Attempting to gain market share from {breached_agent_name}'s misfortune.")


    def handle_new_entrant_alliance_step(self):
        """Handles agent actions for the 'New Entrant Alliance' scenario."""
        round_num = self.model.current_round
        # For this scenario, the "new entrant" is conceptual and not an agent.
        # The existing agents react to its proposals.
        # Let's assume TransUnion is the primary target for alliance by the new entrant.
        target_for_alliance = "TransUnion" # Could be randomized or configured in model
        new_entrant_strength = self.model.scenario_states.get("new_entrant_alliance", {}).get("entrant_strength", 0.5) # 0 to 1

        if self.name == target_for_alliance:
            if round_num == 1: # New entrant proposes alliance
                self.update_incentive("strategic_partnership_assessment")
                # Vote based on perceived strength of new entrant vs risk
                if new_entrant_strength > 0.6:
                    self.vote = "accept_alliance_proposal"
                    self.trust_level += 0.1 # Optimism about new tech/data
                else:
                    self.vote = "reject_alliance_proposal"
                print(f"{self.name} (Round {round_num}): New entrant proposes alliance. Voted '{self.vote}'. Incentive: {self.current_incentive}")
            elif round_num == 2 and self.vote == "accept_alliance_proposal":
                self.market_share += 0.05 * new_entrant_strength # Gain share through alliance
                print(f"{self.name} (Round {round_num}): Alliance formed. Market share increased.")

        else: # Experian and Equifax
            if round_num == 1: # News of potential alliance
                self.update_incentive("competitive_response_to_alliance")
                self.vote = "observe_alliance_formation"
                print(f"{self.name} (Round {round_num}): Observing {target_for_alliance}'s potential alliance. Incentive: {self.current_incentive}")
            elif round_num == 2:
                # If alliance was formed, they might react more strongly
                if self.model.get_agent_by_name(target_for_alliance).vote == "accept_alliance_proposal":
                    self.vote = "counter_alliance_strategy"
                    self.trust_level -= 0.05 # Slightly less trust in the system due to new dynamics
                    print(f"{self.name} (Round {round_num}): {target_for_alliance} formed an alliance. Planning counter-strategy.")


class ExperianAgent(CreditBureauAgent):
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model, "Experian", "profit_maximization")
        # Experian-specific attributes or behaviors can be added here

class EquifaxAgent(CreditBureauAgent):
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model, "Equifax", "market_share_expansion")
        # Equifax-specific attributes or behaviors can be added here

class TransUnionAgent(CreditBureauAgent):
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model, "TransUnion", "data_security_focus")
        # TransUnion-specific attributes or behaviors can be added here
