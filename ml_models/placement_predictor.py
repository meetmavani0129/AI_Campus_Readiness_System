"""
Placement Predictor Module
--------------------------
Calculates the probability percentage of a student getting placed 
based on a trained Random Forest Regressor model.
"""

import os
import joblib
import pandas as pd
import numpy as np

# Load model globally to avoid loading it on every request
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, 'rf_placement_model.pkl')

_placement_model = None

def get_placement_model():
    global _placement_model
    if _placement_model is None:
        if os.path.exists(MODEL_PATH):
            _placement_model = joblib.load(MODEL_PATH)
        else:
            print(f"Warning: Model not found at {MODEL_PATH}.")
    return _placement_model

def predict_placement(features):
    """
    Predicts the placement probability.
    
    Args:
        features (dict): E.g., CGPA, Coding_Ability, Technical_Score, 
                         Communication_Score, Projects, Internships
                         
    Returns:
        int: A probability percentage (0-100)
    """
    model = get_placement_model()
    
    expected_cols = ['CGPA', 'Coding_Ability', 'Technical_Score', 'Communication_Score', 'Projects', 'Internships']
    
    # Fallback if model doesn't exist
    if model is None:
        return 50

    # Extract features in exact order expected by model
    input_data = {col: [features.get(col, 0)] for col in expected_cols}
    df_input = pd.DataFrame(input_data)
    
    # Predict continuous value 0-100
    predicted_prob = model.predict(df_input)[0]
    
    # Clip between 0 and 100, cast to int for UI
    final_prob = int(np.clip(np.round(predicted_prob, 0), 0, 100))
    
    return final_prob

if __name__ == '__main__':
    dummy_features = {
        "CGPA": 8.5, "Coding_Ability": 80, "Technical_Score": 75, 
        "Communication_Score": 90, "Projects": 3, "Internships": 1
    }
    print("Test Placement Probability:", predict_placement(dummy_features), "%")
