import pandas as pd
import numpy as np
import os

def generate_student_dataset(num_samples=2000):
    np.random.seed(42)
    
    # Generate IDs
    student_ids = [f"STU{str(i).zfill(5)}" for i in range(1, num_samples + 1)]
    
    # Generate basic academic and skill features
    cgpa = np.clip(np.random.normal(7.5, 1.2, num_samples), 5.0, 10.0).round(2)
    python_score = np.clip(np.random.normal(70, 15, num_samples), 20, 100).astype(int)
    sql_score = np.clip(np.random.normal(65, 18, num_samples), 20, 100).astype(int)
    ml_score = np.clip(np.random.normal(55, 20, num_samples), 10, 100).astype(int)
    dsa_score = np.clip(np.random.normal(60, 20, num_samples), 10, 100).astype(int)
    web_score = np.clip(np.random.normal(65, 18, num_samples), 20, 100).astype(int)
    cloud_score = np.clip(np.random.normal(50, 22, num_samples), 10, 100).astype(int)
    
    aptitude_score = np.clip(np.random.normal(70, 15, num_samples), 30, 100).astype(int)
    communication_score = np.clip(np.random.normal(75, 12, num_samples), 30, 100).astype(int)
    
    # Generate experience metrics
    projects_count = np.clip(np.random.poisson(2, num_samples), 0, 10).astype(int)
    internship_exp = np.clip(np.random.poisson(0.5, num_samples), 0, 4).astype(int)
    certifications = np.clip(np.random.poisson(1, num_samples), 0, 6).astype(int)
    
    # Synthesize targets based on the features to make realistic data
    # Readiness Score (0-100)
    cgpa_norm = (cgpa / 10.0) * 100
    avg_tech = (python_score + sql_score + ml_score + dsa_score + web_score + cloud_score) / 6.0
    
    base_readiness = (cgpa_norm * 0.2) + (avg_tech * 0.3) + (aptitude_score * 0.15) + (communication_score * 0.15)
    bonus_readiness = (projects_count * 2) + (internship_exp * 4) + (certifications * 2)
    
    readiness_score = np.clip(base_readiness + bonus_readiness + np.random.normal(0, 5, num_samples), 10, 100).astype(int)
    
    # Placement Probability (0-100)
    # Higher emphasis on DSA, Projects, Internships, Communication
    base_placement = (cgpa_norm * 0.25) + (dsa_score * 0.2) + (communication_score * 0.15) + (aptitude_score * 0.1)
    bonus_placement = (projects_count * 3) + (internship_exp * 6) + (certifications * 1.5)
    
    placement_probability = np.clip(base_placement + bonus_placement + np.random.normal(0, 6, num_samples), 5, 95).astype(int)

    # Compile DataFrame
    df = pd.DataFrame({
        'Student_ID': student_ids,
        'CGPA': cgpa,
        'Python_score': python_score,
        'SQL_score': sql_score,
        'MachineLearning_score': ml_score,
        'DSA_score': dsa_score,
        'Web_score': web_score,
        'Cloud_score': cloud_score,
        'Aptitude_score': aptitude_score,
        'Projects_count': projects_count,
        'Internship_experience': internship_exp,
        'Certifications_count': certifications,
        'Communication_score': communication_score,
        'Readiness_score': readiness_score,
        'Placement_probability': placement_probability
    })
    
    return df

if __name__ == "__main__":
    print("Generating synthetic student dataset...")
    df = generate_student_dataset(2000)
    
    out_dir = '../dataset'
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
        
    out_path = os.path.join(out_dir, 'student_dataset.csv')
    df.to_csv(out_path, index=False)
    
    print(f"Dataset successfully created with {len(df)} records!")
    print(f"Saved to: {os.path.abspath(out_path)}")
    print("\nSample Data:")
    print(df.head())
