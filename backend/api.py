import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from app.model import CreditRatingModel # Import your Mesa model
from app.brief_generator import generate_brief # Import the brief generator

app = Flask(__name__)
CORS(app) # Enable CORS for all routes
# Add pandas to requirements.txt if not already there via Mesa

# --- Simulation Management (Simplified) ---
# In a real app, you'd use a database or a more robust in-memory store.
active_simulation = {
    "id": None,
    "model": None,
    "model_data": None,
    "agent_data": None,
    "current_round": 0,
    "total_rounds": 0,
    "status": "idle", # idle, running, completed, error
    "scenario_id": None,
    # Store DataFrames directly for brief generation, convert to dicts for /data endpoint only
    "model_data_df": None, 
    "agent_data_df": None
}

# --- Scenario Definitions ---
# These could be loaded from a config file or database
AVAILABLE_SCENARIOS = {
    "exclusivity_gambit": {
        "id": "exclusivity_gambit",
        "name": "Exclusivity Gambit",
        "description": "Experian attempts to secure an exclusive data-sharing agreement, aiming for market dominance.",
        "rounds": 5, # Default number of rounds for this scenario
        "image_url": "/placeholder.svg" 
    },
    "data_breach_response": {
        "id": "data_breach_response",
        "name": "Data Breach Response",
        "description": "One bureau experiences a data breach, testing trust and crisis management across the industry.",
        "rounds": 5,
        "image_url": "/placeholder.svg"
    },
    "new_entrant_alliance": {
        "id": "new_entrant_alliance",
        "name": "New Entrant Alliance",
        "description": "A new fintech startup proposes an alliance, potentially disrupting the existing market dynamics.",
        "rounds": 5,
        "image_url": "/placeholder.svg"
    }
}

# --- API Endpoints ---

@app.route('/api/scenarios', methods=['GET'])
def get_scenarios():
    """Returns a list of available scenarios."""
    return jsonify(list(AVAILABLE_SCENARIOS.values()))

@app.route('/api/simulation/start', methods=['POST'])
def start_simulation():
    """
    Starts a new simulation for a selected scenario.
    Expects JSON: {"scenario_id": "scenario_name_id", "num_rounds": Optional[int]}
    """
    global active_simulation
    if active_simulation["status"] == "running":
        return jsonify({"error": "Another simulation is already running"}), 400

    data = request.get_json()
    scenario_id = data.get('scenario_id')
    num_rounds_override = data.get('num_rounds')


    if not scenario_id or scenario_id not in AVAILABLE_SCENARIOS:
        return jsonify({"error": "Invalid scenario_id"}), 400

    scenario_config = AVAILABLE_SCENARIOS[scenario_id]
    num_rounds = num_rounds_override if num_rounds_override else scenario_config["rounds"]

    try:
        print(f"Starting simulation for scenario: {scenario_id} with {num_rounds} rounds.")
        model = CreditRatingModel(
            scenario_id=scenario_id,
            scenario_rounds=num_rounds
            # Add other model params like num_agents if they are configurable via API
        )
        active_simulation = {
            "id": f"sim_{scenario_id}_{model.random.randint(1000, 9999)}", # Simple unique ID
            "model": model,
            "model_data_frames": [], # Store dataframes per round
            "agent_data_frames": [],  # Store dataframes per round
            "current_round": 0,
            "total_rounds": num_rounds,
            "status": "running",
            "scenario_id": scenario_id
        }
        
        # Run the first step to initialize data, or run all steps if non-interactive for now
        # For round-by-round, we'll call model.step() in a separate endpoint or loop here.
        # For now, let's run the whole simulation and collect all data.

        model_df, agent_df = model.run_model() # This runs all rounds as per current model.py
        
        # Store DataFrames for potential brief generation
        active_simulation["model_data_df"] = model_df
        active_simulation["agent_data_df"] = agent_df
        
        # Convert to dicts for JSON response for the /data endpoint later
        active_simulation["model_data_full"] = model_df.to_dict(orient='records')
        active_simulation["agent_data_full"] = agent_df.to_dict(orient='records')
        
        active_simulation["status"] = "completed"
        active_simulation["current_round"] = num_rounds # Since it ran completely

        print(f"Simulation {active_simulation['id']} completed.")
        # For true round-by-round, you would not call run_model() here.
        # Instead, you'd initialize the model and then have another endpoint for /step

        return jsonify({
            "simulation_id": active_simulation["id"],
            "status": active_simulation["status"],
            "scenario_id": active_simulation["scenario_id"],
            "total_rounds": active_simulation["total_rounds"],
            "message": f"Simulation for {scenario_id} started and completed."
        }), 201

    except Exception as e:
        active_simulation["status"] = "error"
        print(f"Error starting simulation: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/simulation/data/<simulation_id>', methods=['GET'])
def get_simulation_data(simulation_id):
    """
    Returns the collected data for a simulation.
    For now, returns all data collected up to the point of completion.
    Later, this can be adapted for round-by-round fetching.
    """
    global active_simulation
    if active_simulation["id"] != simulation_id:
        return jsonify({"error": "Simulation not found or ID mismatch"}), 404

    # For round-by-round, you'd slice or return data for a specific round.
    # query_round = request.args.get('round', type=int)

    return jsonify({
        "simulation_id": active_simulation["id"],
        "scenario_id": active_simulation["scenario_id"],
        "status": active_simulation["status"],
        "current_round": active_simulation["current_round"], # This will be total_rounds if completed
        "total_rounds": active_simulation["total_rounds"],
        "model_data": active_simulation.get("model_data_full", []), # Full data
        "agent_data": active_simulation.get("agent_data_full", [])   # Full data
    })

@app.route('/api/simulation/status/<simulation_id>', methods=['GET'])
def get_simulation_status(simulation_id):
    """Gets the current status of a simulation."""
    global active_simulation
    if active_simulation["id"] != simulation_id:
        return jsonify({"error": "Simulation not found or ID mismatch"}), 404

    return jsonify({
        "simulation_id": active_simulation["id"],
        "scenario_id": active_simulation["scenario_id"],
        "status": active_simulation["status"],
        "current_round": active_simulation["current_round"],
        "total_rounds": active_simulation["total_rounds"],
    })

@app.route('/api/simulation/brief/<simulation_id>', methods=['GET'])
def get_simulation_brief(simulation_id):
    """Generates and returns a strategic brief for a completed simulation."""
    global active_simulation
    if active_simulation["id"] != simulation_id:
        return jsonify({"error": "Simulation not found or ID mismatch"}), 404

    if active_simulation["status"] != "completed":
        return jsonify({"error": "Brief can only be generated for completed simulations."}), 400

    if active_simulation["model_data_df"] is None or active_simulation["agent_data_df"] is None:
        return jsonify({"error": "Simulation data (DataFrames) not found. Cannot generate brief."}), 500
        
    try:
        scenario_id = active_simulation["scenario_id"]
        model_df = active_simulation["model_data_df"] # Use stored DataFrame
        agent_df = active_simulation["agent_data_df"] # Use stored DataFrame
        
        # Get perspective from query parameter, default to "CRO"
        perspective = request.args.get('perspective', 'CRO')
        
        # Validate perspective if necessary
        valid_perspectives = ["CRO", "Regulator", "Investor"]
        if perspective not in valid_perspectives:
            return jsonify({"error": f"Invalid perspective. Must be one of {valid_perspectives}"}), 400

        brief_data = generate_brief(scenario_id, model_df, agent_df, perspective=perspective)
        return jsonify(brief_data), 200

    except Exception as e:
        print(f"Error generating brief: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to generate brief: {str(e)}"}), 500


if __name__ == '__main__':
    # Make sure to run this from the 'backend' directory, so 'app.model' can be imported.
    # Example: python api.py
    # Or using Flask CLI: FLASK_APP=api.py flask run
    app.run(debug=True, port=5001) # Using port 5001 to avoid conflict with React's default 5173
