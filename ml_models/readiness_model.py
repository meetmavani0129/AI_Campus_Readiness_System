"""
Readiness Model Module
----------------------
This module contains the logic to predict a student's overall 
campus readiness score using a trained Random Forest model.
"""

import os
import joblib
import pandas as pd
import numpy as np

# Load model globally to avoid loading it on every request
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'rf_readiness_model.pkl')
_model = None

def get_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            print(f"Warning: Model not found at {MODEL_PATH}. Returning dummy scores.")
    return _model

def get_readiness_category(score):
    """Classifies the numerical score into a category."""
    if score < 50:
        return "Beginner"
    elif score <= 75:
        return "Intermediate"
    else:
        return "Placement Ready"

def predict_readiness(features):
    """
    Predicts the campus readiness score.
    
    Args:
        features (dict): Dictionary containing student metrics 
                         (CGPA, Programming, Technical, Aptitude, Projects, 
                          Internships, Certifications, Communication)
                         
    Returns:
        tuple: (float score, str category)
    """
    model = get_model()
    
    expected_cols = ['CGPA', 'Programming', 'Technical', 'Aptitude', 'Projects', 'Internships', 'Certifications', 'Communication']
    
    # Fallback if model doesn't exist yet
    if model is None:
        score = 50.0 + (features.get('CGPA', 5.0) * 5)
        return min(np.round(score, 2), 100), get_readiness_category(score)

    # Extract features in exact order expected by model
    input_data = {col: [features.get(col, 0)] for col in expected_cols}
    df_input = pd.DataFrame(input_data)
    
    # Predict
    predicted_score = model.predict(df_input)[0]
    final_score = np.clip(np.round(predicted_score, 2), 0, 100)
    
    category = get_readiness_category(final_score)
    
    return float(final_score), category

if __name__ == '__main__':
    # Test stub
    dummy_features = {
        "CGPA": 8.5, "Programming": 80, "Technical": 75, 
        "Aptitude": 85, "Projects": 3, "Internships": 1, 
        "Certifications": 2, "Communication": 90
    }
    score, cat = predict_readiness(dummy_features)
    print(f"Test Score: {score} -> Category: {cat}")
