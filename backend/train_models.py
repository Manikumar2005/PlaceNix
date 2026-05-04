import pandas as pd
import numpy as np
import pickle
import os
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_absolute_error, r2_score

def train_and_save_models():
    print("Loading dataset...")
    try:
        df = pd.read_csv('placement_data.csv')
    except FileNotFoundError:
        print("Error: placement_data.csv not found. Run generate_data.py first.")
        return

    # Features and targets
    X = df[['cgpa', 'skills_count', 'projects_count', 'internships_count', 'aptitude_score']]
    y_placement = df['placed']
    y_salary = df['salary']

    # 1. Train Placement Prediction Model (Logistic Regression)
    print("\n--- Training Placement Model (Logistic Regression) ---")
    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X, y_placement, test_size=0.2, random_state=42)
    
    placement_model = LogisticRegression()
    placement_model.fit(X_train_p, y_train_p)
    
    y_pred_p = placement_model.predict(X_test_p)
    acc = accuracy_score(y_test_p, y_pred_p)
    print(f"Placement Model Accuracy: {acc * 100:.2f}%")

    # 2. Train Package Prediction Model (Linear Regression)
    # Only train on students who were placed
    print("\n--- Training Package Model (Linear Regression) ---")
    placed_df = df[df['placed'] == 1]
    X_placed = placed_df[['cgpa', 'skills_count', 'projects_count', 'internships_count', 'aptitude_score']]
    y_placed_salary = placed_df['salary']
    
    X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(X_placed, y_placed_salary, test_size=0.2, random_state=42)
    
    salary_model = LinearRegression()
    salary_model.fit(X_train_s, y_train_s)
    
    y_pred_s = salary_model.predict(X_test_s)
    mae = mean_absolute_error(y_test_s, y_pred_s)
    print(f"Package Model MAE: {mae:.2f} LPA")

    # Create models directory if it doesn't exist
    if not os.path.exists('ml_models'):
        os.makedirs('ml_models')

    # Save models
    print("\nSaving models to /ml_models directory...")
    with open('ml_models/placement_model.pkl', 'wb') as f:
        pickle.dump(placement_model, f)
        
    with open('ml_models/salary_model.pkl', 'wb') as f:
        pickle.dump(salary_model, f)
        
    print("Models saved successfully: ml_models/placement_model.pkl, ml_models/salary_model.pkl")

if __name__ == '__main__':
    train_and_save_models()
