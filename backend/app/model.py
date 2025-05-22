import random
from mesa import Model
from mesa.time import RandomActivation
from mesa.space import MultiGrid
from mesa.datacollection import DataCollector
from .agents import ExperianAgent, EquifaxAgent, TransUnionAgent

class CreditRatingModel(Model):
    """A model with some number of credit bureau agents, capable of running scenarios."""
    def __init__(self, num_agents_experian=1, num_agents_equifax=1, num_agents_transunion=1, width=10, height=10, scenario_id=None, scenario_rounds=5):
        super().__init__()
        self.num_agents_experian = num_agents_experian
        self.num_agents_equifax = num_agents_equifax
        self.num_agents_transunion = num_agents_transunion
        self.grid = MultiGrid(width, height, True)
        self.schedule = RandomActivation(self)
        self.running = True

        self.current_scenario = scenario_id
        self.current_round = 0
        self.total_scenario_rounds = scenario_rounds
        self.scenario_states = {} # To store dynamic data related to the current scenario

        # Create agents first, so agents_map is available for initialize_scenario
        self.agents_map = {} # For easy access by name
        agent_id_counter = 0
        for agent_type_name, count, agent_class in [
            ("Experian", self.num_agents_experian, ExperianAgent),
            ("Equifax", self.num_agents_equifax, EquifaxAgent),
            ("TransUnion", self.num_agents_transunion, TransUnionAgent)
        ]:
            for i in range(count):
                agent_name = f"{agent_type_name}_{i+1}" if count > 1 else agent_type_name
                a = agent_class(agent_id_counter, self)
                a.name = agent_name 
                self.schedule.add(a)
                self.agents_map[agent_name] = a
                x = self.random.randrange(self.grid.width)
                y = self.random.randrange(self.grid.height)
                self.grid.place_agent(a, (x, y))
                agent_id_counter += 1

        # Initialize scenario-specific parameters now that agents exist
        if self.current_scenario:
            self.initialize_scenario(self.current_scenario)
        
        # Data collector
        self.datacollector = DataCollector(
            model_reporters={
                "CurrentRound": "current_round",
                "CurrentScenario": "current_scenario",
                "TotalVotesYes": lambda m: self.collect_total_votes("yes"),
                "TotalVotesNo": lambda m: self.collect_total_votes("no"),
                "TotalVotesAbstain": lambda m: self.collect_total_votes("abstain"),
                # Scenario-specific model reporters can be added here
                "ExclusivityDealSecured": lambda m: m.scenario_states.get("exclusivity_gambit", {}).get("deal_secured_by_experian", None)
            },
            agent_reporters={
                "Name": "name",
                "Vote": "vote",
                "TrustLevel": "trust_level",
                "CurrentIncentive": "current_incentive",
                "MarketShare": "market_share"
            }
        )

    def get_agent_by_name(self, name):
        return self.agents_map.get(name)

    def initialize_scenario(self, scenario_id):
        """Initializes scenario-specific states and agent properties."""
        self.current_round = 0 # Reset round counter for the new scenario
        self.scenario_states[scenario_id] = {} # Initialize state for this scenario
        print(f"Initializing scenario: {scenario_id}")

        if scenario_id == "exclusivity_gambit":
            self.scenario_states[scenario_id]["deal_proposed_by"] = "Experian"
            self.scenario_states[scenario_id]["deal_secured_by_experian"] = None # True, False, or None (undecided)
            self.scenario_states[scenario_id]["major_client_decision_round"] = 3 # Client decides in round 3
            # Experian agent might get a temporary boost in confidence or specific instruction
            experian = self.get_agent_by_name("Experian")
            if experian:
                experian.scenario_data["exclusivity_deal_proposed"] = False # Will be set to true in its step

        elif scenario_id == "data_breach_response":
            # Randomly select one agent to be breached, or specify
            breached_agent_name = self.random.choice(["Experian", "Equifax", "TransUnion"])
            self.scenario_states[scenario_id]["breached_agent"] = breached_agent_name
            self.scenario_states[scenario_id]["breach_severity"] = self.random.uniform(0.3, 0.8) # Example severity
            print(f"Data Breach Scenario: {breached_agent_name} is the breached agent.")
            breached_agent = self.get_agent_by_name(breached_agent_name)
            if breached_agent:
                 breached_agent.scenario_data["is_breached"] = True
                 # Initial impact is handled in agent's scenario step

        elif scenario_id == "new_entrant_alliance":
            self.scenario_states[scenario_id]["new_entrant_name"] = "FinDataInnovate"
            # Randomly select one of the incumbents as the primary target for alliance
            self.scenario_states[scenario_id]["alliance_target"] = self.random.choice(["Experian", "Equifax", "TransUnion"])
            self.scenario_states[scenario_id]["entrant_strength"] = self.random.uniform(0.4, 0.7) # Perceived strength
            self.scenario_states[scenario_id]["alliance_formed"] = False
            print(f"New Entrant Alliance Scenario: Target for alliance is {self.scenario_states[scenario_id]['alliance_target']}.")

        # Reset agent votes and incentives at the start of a scenario
        for agent in self.schedule.agents:
            agent.vote = None
            agent.current_incentive = agent.initial_incentive # Reset to initial incentive
            agent.scenario_data = {} # Clear previous scenario agent data


    def step(self):
        """Advance the model by one step, managing scenario progression."""
        self.current_round += 1
        print(f"\n--- Scenario: {self.current_scenario}, Round: {self.current_round}/{self.total_scenario_rounds} ---")

        if self.current_scenario:
            # Scenario-specific logic progression
            scenario_handler_name = f"run_{self.current_scenario}_round"
            scenario_handler = getattr(self, scenario_handler_name, None)
            if scenario_handler:
                scenario_handler()
            else:
                print(f"Warning: No specific round handler found for scenario '{self.current_scenario}'. Agents will perform default step.")
        
        # Agents perform their step (which now includes scenario-specific logic)
        self.schedule.step()
        self.datacollector.collect(self)

        if self.current_scenario and self.current_round >= self.total_scenario_rounds:
            print(f"\n--- Scenario {self.current_scenario} concluded after {self.total_scenario_rounds} rounds. ---")
            self.current_scenario = None # End of scenario
            self.current_round = 0
            # Potentially add post-scenario analysis or cleanup here
            # Reset agents to default state if needed
            for agent in self.schedule.agents:
                agent.current_incentive = agent.initial_incentive
                agent.scenario_data = {}
                agent.vote = None # Clear votes
        elif not self.current_scenario and self.schedule.steps > 0: # Default running if no scenario
             if self.schedule.steps > 10: # Example: stop after 10 default steps if no scenario
                self.running = False


    # --- Scenario-specific round logic ---

    def run_exclusivity_gambit_round(self):
        """Manages round-specific logic for the 'Exclusivity Gambit'."""
        # Agent actions are mostly defined in their own `handle_exclusivity_gambit_step`
        # This model method orchestrates events that affect all agents or the environment.
        client_decision_round = self.scenario_states["exclusivity_gambit"].get("major_client_decision_round", 3)
        experian_agent = self.get_agent_by_name("Experian")

        if self.current_round == client_decision_round:
            # Simulate client decision
            # For simplicity, let's say client decides based on Experian's current trust level vs others
            # This is a placeholder for more complex client decision logic
            experian_trust = experian_agent.trust_level if experian_agent else 0
            avg_competitor_trust = 0
            competitors = [a for a in self.schedule.agents if a.name != "Experian"]
            if competitors:
                avg_competitor_trust = sum(a.trust_level for a in competitors) / len(competitors)

            # Assume deal is more likely if Experian is more trusted and has actively proposed
            # and competitors haven't made a sufficiently strong counter
            experian_proposed = experian_agent.vote == "propose_exclusivity" # Check if Experian made the move

            # Simple decision logic:
            if experian_proposed and experian_trust > (avg_competitor_trust + self.random.uniform(-0.1, 0.1)):
                self.scenario_states["exclusivity_gambit"]["deal_secured_by_experian"] = True
                print("Model: Client decided in favor of Experian's exclusivity deal.")
                if experian_agent: experian_agent.scenario_data["exclusivity_deal_secured"] = True
                # Impact other agents
                for agent in competitors:
                    agent.adjust_trust(experian_agent.name, -0.1) # Trust in Experian might drop further
                    agent.scenario_data["exclusivity_deal_lost"] = True
            else:
                self.scenario_states["exclusivity_gambit"]["deal_secured_by_experian"] = False
                print("Model: Client rejected Experian's exclusivity deal or chose a competitor.")
                if experian_agent: experian_agent.scenario_data["exclusivity_deal_secured"] = False


    def run_data_breach_response_round(self):
        """Manages round-specific logic for 'Data Breach Response'."""
        breached_agent_name = self.scenario_states["data_breach_response"].get("breached_agent")
        breached_agent = self.get_agent_by_name(breached_agent_name)
        severity = self.scenario_states["data_breach_response"].get("breach_severity", 0.5)

        if self.current_round == 1 and breached_agent:
            # Initial impact of the breach
            print(f"Model: Data breach confirmed for {breached_agent_name} with severity {severity:.2f}.")
            # Trust in breached agent from others drops significantly
            for agent in self.schedule.agents:
                if agent.name != breached_agent_name:
                    # This is a general system trust adjustment; ideally, it would be agent-to-agent trust
                    agent.adjust_trust(breached_agent_name, -0.3 * severity) # Adjust trust in the breached entity
            # Breached agent's self-perception of trust also drops (handled in agent's step)

        elif self.current_round == self.total_scenario_rounds: # End of scenario
            print(f"Model: Assessing long-term impacts for {breached_agent_name} after data breach.")
            # Final adjustments or logging could happen here


    def run_new_entrant_alliance_round(self):
        """Manages round-specific logic for 'New Entrant Alliance'."""
        target_agent_name = self.scenario_states["new_entrant_alliance"].get("alliance_target")
        target_agent = self.get_agent_by_name(target_agent_name)
        entrant_strength = self.scenario_states["new_entrant_alliance"].get("entrant_strength", 0.5)

        if self.current_round == 2 and target_agent: # Decision round for alliance
            # Check the target agent's vote (decision)
            if target_agent.vote == "accept_alliance_proposal":
                self.scenario_states["new_entrant_alliance"]["alliance_formed"] = True
                print(f"Model: Alliance formed between {target_agent_name} and new entrant.")
                # Impact: Target agent might gain some capabilities or market perception
                target_agent.adjust_trust(None, 0.1 * entrant_strength) # Boost general trust/optimism slightly
                # Other agents might react
                for agent in self.schedule.agents:
                    if agent.name != target_agent_name:
                        agent.adjust_trust(target_agent_name, -0.05) # Slightly wary of the new alliance
            else:
                self.scenario_states["new_entrant_alliance"]["alliance_formed"] = False
                print(f"Model: Alliance proposal rejected by {target_agent_name}.")


    def collect_total_votes(self, vote_type):
        """Collects the total number of a specific vote type from all agents."""
        if not vote_type: return len(self.schedule.agents) # Count all agents if vote_type is None
        return sum(1 for agent in self.schedule.agents if agent.vote == vote_type)

    def run_model(self, steps=None):
        """Run the model for a specified number of steps or scenario rounds."""
        run_duration = steps
        if self.current_scenario:
            run_duration = self.total_scenario_rounds # Override steps if a scenario is active
            print(f"Starting simulation: Scenario '{self.current_scenario}' for {run_duration} rounds with {self.schedule.get_agent_count()} agents.")
        elif steps:
            print(f"Starting simulation: Default mode for {run_duration} steps with {self.schedule.get_agent_count()} agents.")
        else:
            print("Error: Must specify steps or a scenario to run.")
            return None, None

        for i in range(run_duration):
            self.step()
            if not self.running: # In case running is set to False by some condition
                break
        
        if self.current_scenario: # If scenario was running and finished via step logic
             print(f"Scenario '{self.current_scenario}' processing completed within run_model call.")
        elif steps:
             print(f"\n--- Default Simulation Ended after {run_duration} steps ---")

        return self.datacollector.get_model_vars_dataframe(), self.datacollector.get_agent_vars_dataframe()


# Example of how to run the model (optional, for testing)
if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description="Run Mesa Credit Rating Model Simulation")
    parser.add_argument(
        "--scenario", 
        type=str, 
        choices=["exclusivity_gambit", "data_breach_response", "new_entrant_alliance", "none"], 
        default="exclusivity_gambit",
        help="Scenario ID to run. 'none' for default model run."
    )
    parser.add_argument(
        "--rounds",
        type=int,
        default=5,
        help="Number of rounds/steps for the simulation."
    )
    args = parser.parse_args()

    CHOSEN_SCENARIO = args.scenario if args.scenario != "none" else None
    SCENARIO_DURATION_ROUNDS = args.rounds
    DEFAULT_SIMULATION_STEPS = args.rounds

    model_params = {
        "num_agents_experian": 1,
        "num_agents_equifax": 1,
        "num_agents_transunion": 1,
        "width": 10,
        "height": 10,
        "scenario_id": CHOSEN_SCENARIO,
        "scenario_rounds": SCENARIO_DURATION_ROUNDS # For scenario runs
    }
    model = CreditRatingModel(**model_params)

    print(f"\n--- Running Model for Scenario: {CHOSEN_SCENARIO if CHOSEN_SCENARIO else 'Default'} with {model_params['scenario_rounds'] if CHOSEN_SCENARIO else DEFAULT_SIMULATION_STEPS} steps/rounds ---")

    # --- Run Simulation ---
    if CHOSEN_SCENARIO:
        # When a scenario is chosen, run_model internally uses total_scenario_rounds
        model_data, agent_data = model.run_model() 
    else:
        # For a default run without a specific scenario, pass steps explicitly
        model_data, agent_data = model.run_model(steps=DEFAULT_SIMULATION_STEPS)

    # --- Output Data ---
    if model_data is not None and agent_data is not None:
        pd.set_option('display.max_columns', None)
        pd.set_option('display.width', 200)
        print("\n--- Model Data ---")
        print(model_data)
        
        print(f"\n--- Agent Data (All entries, {SCENARIO_DURATION_ROUNDS if CHOSEN_SCENARIO else DEFAULT_SIMULATION_STEPS} rounds/steps) ---")
        if not agent_data.empty:
            # For better readability of agent data during testing:
            # Sort by Step and then by AgentID for consistent output
            # Display all columns
            print(agent_data.sort_values(by=['Step', 'AgentID']))
        else:
            print("No agent data collected.")

        # Example of accessing specific agent data for 'Experian'
        # Ensure agent naming convention used in the model is reflected here
        experian_agent_name_to_check = "Experian" # If only one Experian agent
        # If multiple agents of a type, the name might be "Experian_1", "Experian_2" etc.
        # This depends on the naming logic in CreditRatingModel __init__
        
        # Find the actual Experian agent name from the collected data if num_agents_experian > 1
        if model_params["num_agents_experian"] > 1:
            experian_names_in_data = [name for name in agent_data["Name"].unique() if "Experian" in name]
            if experian_names_in_data:
                experian_agent_name_to_check = experian_names_in_data[0] # Just pick the first one for display
        
        if not agent_data.empty and experian_agent_name_to_check in agent_data["Name"].unique():
            print(f"\n--- Data for agent: {experian_agent_name_to_check} ---")
            experian_df = agent_data[agent_data['Name'] == experian_agent_name_to_check]
            print(experian_df)
        else:
            print(f"\nNo data found for an agent named containing 'Experian'. Available agent names: {agent_data['Name'].unique()}")
    else:
        print("Simulation did not produce data.")
