import pandas as pd
import numpy as np
import os

def generate_synthetic_data(num_samples=1000):
    np.random.seed(42)
    
    # 1. Generate Core Features
    cgpa = np.clip(np.random.normal(7.5, 1.0, num_samples), 5.0, 10.0)
    programming = np.clip(np.random.normal(65, 15, num_samples), 10, 100).astype(int)
    technical = np.clip(np.random.normal(60, 15, num_samples), 10, 100).astype(int)
    aptitude = np.clip(np.random.normal(70, 12, num_samples), 10, 100).astype(int)
    projects = np.clip(np.random.poisson(2, num_samples), 0, 10).astype(int)
    internships = np.clip(np.random.poisson(0.5, num_samples), 0, 4).astype(int)
    certifications = np.clip(np.random.poisson(1, num_samples), 0, 6).astype(int)
    communication = np.clip(np.random.normal(70, 15, num_samples), 20, 100).astype(int)

    # 2. Heuristic logic to generate "Actual_Readiness_Score"
    # This ensures our ML model has actual structure to learn.
    # CGPA (out of 10) gets scaled * 10 = max 100
    base_score = (cgpa * 10 * 0.25) + \
                 (programming * 0.20) + \
                 (technical * 0.20) + \
                 (aptitude * 0.15) + \
                 (communication * 0.10)
    
    # Bonuses for experience
    bonus_projects = projects * 2.5
    bonus_internships = internships * 5.0
    bonus_certs = certifications * 2.0
    
    total_score = base_score + bonus_projects + bonus_internships + bonus_certs
    
    # Add a bit of random noise
    total_score += np.random.normal(0, 3, num_samples)
    
    # Clip between 0 and 100
    readiness_score = np.clip(total_score, 0, 100).astype(int)

    df = pd.DataFrame({
        'CGPA': cgpa.round(2),
        'Programming': programming,
        'Technical': technical,
        'Aptitude': aptitude,
        'Projects': projects,
        'Internships': internships,
        'Certifications': certifications,
        'Communication': communication,
        'Readiness_Score': readiness_score
    })
    
    return df

if __name__ == "__main__":
    print("Generating synthetic student dataset...")
    df = generate_synthetic_data(1500)
    
    out_dir = '../dataset'
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
        
    out_path = os.path.join(out_dir, 'synthetic_student_data.csv')
    df.to_csv(out_path, index=False)
    print(f"Dataset generated with {len(df)} records and saved to {out_path}")
    print("\nSample Data:")
    print(df.head())
