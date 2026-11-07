import pandas as pd
import numpy as np
import os

def generate_domain_data(num_samples=2500):
    np.random.seed(42)
    
    # 1. Generate Core Features
    programming = np.clip(np.random.normal(65, 15, num_samples), 10, 100).astype(int)
    technical = np.clip(np.random.normal(60, 15, num_samples), 10, 100).astype(int)
    aptitude = np.clip(np.random.normal(70, 12, num_samples), 10, 100).astype(int)
    communication = np.clip(np.random.normal(70, 15, num_samples), 20, 100).astype(int)

    domains = []
    
    # 2. Heuristic rules to map scores to Top Domain
    for i in range(num_samples):
        prog = programming[i]
        tech = technical[i]
        apt = aptitude[i]
        comm = communication[i]
        
        # Define logic
        if tech > 80 and apt > 80 and prog < 90:
            domain = "Data Science"
        elif prog > 85 and tech > 75:
            domain = "Software Development"
        elif prog > 70 and tech < 80:
            # high programming, moderate tech
            domain = "Web Development"
        elif tech > 80 and comm < 75 and prog < 80:
            domain = "Cybersecurity"
        elif tech > 85 and prog > 80 and apt > 80:
            # extremely well rounded
            domain = "Cloud and DevOps"
        elif comm > 85 and apt > 85:
            # Non-tech heavy
            domain = "Software Development"
        else:
            # Fallback
            domain = np.random.choice(["Web Development", "Software Development", "Data Science", "Cybersecurity", "Cloud and DevOps"])
            
        domains.append(domain)

    df = pd.DataFrame({
        'Programming_Score': programming,
        'Technical_Score': technical,
        'Aptitude_Score': aptitude,
        'Communication_Score': communication,
        'Domain': domains
    })
    
    return df

if __name__ == "__main__":
    print("Generating synthetic domain dataset...")
    df = generate_domain_data(3000)
    
    out_dir = '../dataset'
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
        
    out_path = os.path.join(out_dir, 'domain_dataset.csv')
    df.to_csv(out_path, index=False)
    print(f"Dataset generated with {len(df)} records and saved to {out_path}")
    print("\nDomain Distribution:")
    print(df['Domain'].value_counts())
