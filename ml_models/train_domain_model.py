import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

def train_domain_model():
    dataset_path = '../dataset/domain_dataset.csv'
    
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}. Run generate_domain_data.py first.")
        return

    print("Loading dataset...")
    df = pd.read_csv(dataset_path)

    # Features and Target
    X = df[['Programming_Score', 'Technical_Score', 'Aptitude_Score', 'Communication_Score']]
    y = df['Domain']

    # Encode categorical target strings
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    # Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    print(f"\nModel Evaluation:")
    print(f"  Accuracy: {accuracy * 100:.2f}%\n")
    print(classification_report(y_test, predictions, target_names=le.classes_))

    # Save Model
    model_path = 'rf_domain_model.pkl'
    joblib.dump(model, model_path)
    
    # Save the label classes to decode probabilities later
    classes_path = 'domain_classes.pkl'
    joblib.dump(le.classes_, classes_path)
    
    print(f"Model successfully saved to {model_path} and classes to {classes_path}")

if __name__ == "__main__":
    train_domain_model()
