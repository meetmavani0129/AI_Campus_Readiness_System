import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

def train_readiness_model():
    dataset_path = '../dataset/synthetic_student_data.csv'
    
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}. Run generate_data.py first.")
        return

    print("Loading dataset...")
    df = pd.read_csv(dataset_path)

    # Features and Target
    X = df[['CGPA', 'Programming', 'Technical', 'Aptitude', 'Projects', 'Internships', 'Certifications', 'Communication']]
    y = df['Readiness_Score']

    # Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    print(f"Model Evaluation:")
    print(f"  MSE: {mse:.2f}")
    print(f"  R2 Score: {r2:.4f}")

    # Save Model
    model_path = 'rf_readiness_model.pkl'
    joblib.dump(model, model_path)
    print(f"Model successfully saved to {model_path}")

if __name__ == "__main__":
    train_readiness_model()
