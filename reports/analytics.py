"""
Analytics Module
----------------
Generates batch reports or visual insights derived from the dataset
or database regarding overall university readiness.
"""

import pandas as pd
import os

def generate_summary_report():
    """
    Loads dataset and prints a basic statistical summary.
    """
    dataset_path = os.path.join(os.path.dirname(__file__), '../dataset/student_dataset.csv')
    
    try:
        df = pd.read_csv(dataset_path)
        print("====== University Readiness Summary ======")
        print(f"Total Students Analyzed: {len(df)}")
        print(f"Average CGPA: {df['CGPA'].mean():.2f}")
        
        # Calculate readiness based on model's logic
        ready_students = df[df['Placement_probability'] > 75]
        print(f"Placement Ready Students (>75% prob): {(len(ready_students) / len(df)) * 100:.1f}%")
        
        print("\nAverage Skill Breakdowns:")
        print(f"  Python: {df['Python_score'].mean():.1f}")
        print(f"  SQL: {df['SQL_score'].mean():.1f}")
        print(f"  DSA: {df['DSA_score'].mean():.1f}")
        print(f"  Web Dev: {df['Web_score'].mean():.1f}")
        print(f"  Machine Learning: {df['MachineLearning_score'].mean():.1f}")
        print("==========================================")
    except FileNotFoundError:
        print("Dataset not found. Please ensure student_dataset.csv exists.")

if __name__ == '__main__':
    generate_summary_report()
