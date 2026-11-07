"""
Domain Prediction Module
------------------------
Predicts the most suitable career domain based on student
programming, technical, communication, and aptitude scores.
"""
import os
import joblib
import pandas as pd
import numpy as np

# Load model and classes globally
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, 'rf_domain_model.pkl')
CLASSES_PATH = os.path.join(BASE_DIR, 'domain_classes.pkl')

_domain_model = None
_domain_classes = None

def get_domain_model():
    global _domain_model, _domain_classes
    if _domain_model is None:
        if os.path.exists(MODEL_PATH) and os.path.exists(CLASSES_PATH):
            _domain_model = joblib.load(MODEL_PATH)
            _domain_classes = joblib.load(CLASSES_PATH)
        else:
            print(f"Warning: Domain model or classes not found at {MODEL_PATH} or {CLASSES_PATH}.")
    return _domain_model, _domain_classes

def predict_domain(features):
    """
    Predicts domain and returning probabilities.

    Args:
        features (dict): E.g. Programming, Technical, Aptitude, Communication

    Returns:
        tuple: (recommended_domain, confidence_score_percentage, domain_distribution_dict)
    """
    model, classes = get_domain_model()

    # Prioritize explicit _Score keys (as used during training), but allow more general keys from the frontend.
    input_data = {
        'Programming_Score': [
            features.get('Programming_Score', features.get('Programming', 60))
        ],
        'Technical_Score': [
            features.get('Technical_Score', features.get('Technical', 60))
        ],
        'Aptitude_Score': [
            features.get('Aptitude_Score', features.get('Aptitude', 60))
        ],
        'Communication_Score': [
            features.get('Communication_Score', features.get('Communication', 60))
        ],
    }

    if model is None or classes is None:
        # Fallback dummy logic
        return "Software Engineering", 80.0, {"Software Engineering": 80.0, "Data Science": 20.0}

    df_input = pd.DataFrame(input_data)

    # Predict probabilities for all classes
    probas = model.predict_proba(df_input)[0]

    # Get indices of top 2 probabilities
    top_two_idx = np.argsort(probas)[-2:][::-1]
    
    best_domain = classes[top_two_idx[0]]
    confidence = float(np.round(probas[top_two_idx[0]] * 100, 2))
    
    # If the second domain is reasonably likely (e.g., > 15%), include it
    if probas[top_two_idx[1]] > 0.15:
        second_domain = classes[top_two_idx[1]]
        best_domain = f"{best_domain} & {second_domain}"

    # Create distribution map
    distribution = {classes[i]: float(np.round(probas[i] * 100, 2)) for i in range(len(classes))}

    return best_domain, confidence, distribution

if __name__ == '__main__':
    print("Suggested Domain:", predict_domain({'dev_score': 85, 'ml_score': 60}))
