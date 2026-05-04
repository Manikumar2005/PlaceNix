import pandas as pd
import numpy as np

def generate_synthetic_data(num_samples=300):
    np.random.seed(42)
    
    # Generate features
    cgpa = np.random.uniform(5.0, 10.0, num_samples)
    skills_count = np.random.randint(0, 16, num_samples)
    projects_count = np.random.randint(0, 6, num_samples)
    internships_count = np.random.randint(0, 4, num_samples)
    aptitude_score = np.random.uniform(30.0, 100.0, num_samples)
    
    # Calculate a raw score to determine placement probability
    raw_score = (cgpa * 10) + (skills_count * 2) + (projects_count * 5) + (internships_count * 10) + (aptitude_score * 0.3)
    
    noise = np.random.normal(0, 15, num_samples)
    final_score = raw_score + noise
    
    threshold = np.percentile(final_score, 30)
    placed = (final_score > threshold).astype(int)
    
    # Base salary = 3.0 LPA
    base_salary = 3.0
    salary = np.zeros(num_samples)
    
    for i in range(num_samples):
        if placed[i] == 1:
            merit_bonus = (max(0, cgpa[i] - 6.0) * 1.5) + (internships_count[i] * 1.0) + (projects_count[i] * 0.5) + (skills_count[i] * 0.2)
            noise_salary = np.random.normal(0, 1.0)
            calculated_salary = base_salary + merit_bonus + noise_salary
            salary[i] = max(3.0, round(calculated_salary, 1))
            
    # Create DataFrame
    df = pd.DataFrame({
        'cgpa': np.round(cgpa, 2),
        'skills_count': skills_count,
        'projects_count': projects_count,
        'internships_count': internships_count,
        'aptitude_score': np.round(aptitude_score, 1),
        'placed': placed,
        'salary': salary
    })
    
    df.to_csv('placement_data.csv', index=False)
    print(f"Successfully generated placement_data.csv with {num_samples} records.")
    print(df.head())

if __name__ == '__main__':
    generate_synthetic_data()
