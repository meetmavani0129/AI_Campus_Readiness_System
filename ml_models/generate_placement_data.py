import pandas as pd
import numpy as np
import os

def generate_placement_data(num_samples=2500):
    np.random.seed(42)
    
    # 1. Generate Core Features
    cgpa = np.clip(np.random.normal(7.5, 1.0, num_samples), 5.0, 10.0)
    # the mapping refers to Coding Ability, Technical Test Score
    coding = np.clip(np.random.normal(65, 15, num_samples), 10, 100).astype(int)
    technical = np.clip(np.random.normal(60, 15, num_samples), 10, 100).astype(int)
    communication = np.clip(np.random.normal(70, 15, num_samples), 20, 100).astype(int)
    projects = np.clip(np.random.poisson(2, num_samples), 0, 10).astype(int)
    internships = np.clip(np.random.poisson(0.5, num_samples), 0, 4).astype(int)

    # 2. Heuristic logic to generate "Placement Probability"
    # Basic probability calculation
    cgpa_norm = (cgpa / 10.0) * 100
    
    # Weighted calculation
    base_score = (cgpa_norm * 0.25) + \
                 (coding * 0.25) + \
                 (technical * 0.20) + \
                 (communication * 0.20)
                 
    # Bonuses for experience
    bonus_projects = projects * 3.0
    bonus_internships = internships * 5.0
    
    total_score = base_score + bonus_projects + bonus_internships
    
    # Add a bit of random noise (e.g. interview luck)
    total_score += np.random.normal(0, 4, num_samples)
    
    # Placement probabilities often skew towards 0 or 100 in extremes
    # We will simply clip to 0-100 to keep it as a linear regression target that feels like a percentage
    prob_score = np.clip(total_score, 5, 95).astype(int) # Nobody is 0% or 100%

    df = pd.DataFrame({
        'CGPA': cgpa.round(2),
        'Coding_Ability': coding,
        'Technical_Score': technical,
        'Communication_Score': communication,
        'Projects': projects,
        'Internships': internships,
        'Placement_Probability': prob_score
    })
    
    return df

if __name__ == "__main__":
    print("Generating synthetic placement dataset...")
    df = generate_placement_data(3000)
    
    out_dir = '../dataset'
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
        
    out_path = os.path.join(out_dir, 'placement_dataset.csv')
    df.to_csv(out_path, index=False)
    print(f"Dataset generated with {len(df)} records and saved to {out_path}")
    print("\nSample Data:")
    print(df.head())
