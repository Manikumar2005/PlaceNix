from app import create_app
from database import db
from models import Student, Company, InterviewQuestion, Prediction, Resume

app = create_app()

def seed_data():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        # 1. Add Companies
        companies_data = [
            # Ongoing Drives (5)
            Company(name="Google", role="Software Engineer", package="30 LPA", eligibility_cgpa=8.0, required_skills="Python, C++, Data Structures, Algorithms", drive_date="2026-05-01", status="ongoing"),
            Company(name="Microsoft", role="SDE 1", package="25 LPA", eligibility_cgpa=7.5, required_skills="C#, Java, System Design", drive_date="2026-05-01", status="ongoing"),
            Company(name="Amazon", role="SDE", package="22 LPA", eligibility_cgpa=7.0, required_skills="Java, AWS, Problem Solving", drive_date="2026-05-01", status="ongoing"),
            Company(name="Meta", role="Frontend Engineer", package="28 LPA", eligibility_cgpa=8.0, required_skills="React, JavaScript, CSS", drive_date="2026-05-01", status="ongoing"),
            Company(name="Netflix", role="Backend Engineer", package="35 LPA", eligibility_cgpa=8.5, required_skills="Java, Spring Boot, Microservices", drive_date="2026-05-01", status="ongoing"),
            
            # Upcoming
            Company(name="TCS", role="System Engineer", package="7 LPA", eligibility_cgpa=6.0, required_skills="Java, Python, SQL", drive_date="2026-05-06", status="upcoming"),
            Company(name="Infosys", role="Specialist Programmer", package="8 LPA", eligibility_cgpa=6.5, required_skills="Python, React, Node.js", drive_date="2026-05-10", status="upcoming"),
            Company(name="Accenture", role="Advanced App Engineering", package="6.5 LPA", eligibility_cgpa=6.0, required_skills="Java, Spring Boot, SQL", drive_date="2026-05-15", status="upcoming"),
            Company(name="Wipro", role="Project Engineer", package="6 LPA", eligibility_cgpa=6.0, required_skills="Java, HTML, CSS, JavaScript", drive_date="2026-05-20", status="upcoming"),
            Company(name="IBM", role="Associate System Engineer", package="8.5 LPA", eligibility_cgpa=7.0, required_skills="Python, Machine Learning, SQL", drive_date="2026-05-25", status="upcoming"),
            Company(name="Deloitte", role="Analyst", package="7.5 LPA", eligibility_cgpa=6.5, required_skills="SQL, Excel, Data Analysis", drive_date="2026-05-30", status="upcoming"),
            Company(name="Oracle", role="Application Developer", package="18 LPA", eligibility_cgpa=7.5, required_skills="Java, SQL, PL/SQL", drive_date="2026-06-02", status="upcoming"),
            Company(name="Cisco", role="Network Engineer", package="15 LPA", eligibility_cgpa=7.0, required_skills="Networking, Linux, Python", drive_date="2026-06-04", status="upcoming"),
            Company(name="Adobe", role="MTS", package="22 LPA", eligibility_cgpa=8.0, required_skills="C++, Algorithms, OOPS", drive_date="2026-06-05", status="upcoming"),
            Company(name="Salesforce", role="Software Engineer", package="20 LPA", eligibility_cgpa=7.5, required_skills="Java, Apex, LWC", drive_date="2026-06-06", status="upcoming"),
        ]
        
        db.session.add_all(companies_data)
        db.session.commit()
        
        # 2. Add Interview Questions
        all_companies = Company.query.all()
        
        technical_questions = [
            "Explain the difference between a process and a thread.",
            "What is the difference between TCP and UDP?",
            "Explain the concepts of OOP (Object-Oriented Programming).",
            "What is indexing in a database?",
            "How does a hash table work under the hood?",
            "What are the differences between SQL and NoSQL?",
            "Explain the concept of virtualization.",
            "What is a REST API and what are its constraints?",
            "How does garbage collection work in modern languages?",
            "Explain the CAP theorem and its implications."
        ]

        coding_questions = [
            "Reverse a linked list in O(n) time and O(1) space.",
            "Find the lowest common ancestor in a binary tree.",
            "Design an LRU cache.",
            "Write a program to detect a cycle in a directed graph.",
            "Implement the merge sort algorithm.",
            "Find the maximum subarray sum using Kadane's algorithm.",
            "Check if a string is a valid palindrome, ignoring special characters.",
            "Implement a queue using two stacks.",
            "Write a function to return the nth Fibonacci number optimally.",
            "Find the first non-repeating character in a string."
        ]

        hr_questions = [
            "Tell me about a time you had a conflict with a teammate.",
            "Why do you want to work at our company?",
            "Tell me about a time you failed and what you learned from it.",
            "Where do you see yourself in 5 years?",
            "Describe a challenging project you worked on and how you overcame the obstacles.",
            "How do you handle working under tight deadlines?",
            "What is your biggest weakness and how are you addressing it?",
            "Describe a situation where you had to learn a new technology quickly.",
            "How do you prioritize your tasks when you have multiple deadlines?",
            "Why should we hire you over other candidates?"
        ]
        
        questions_data = []
        for company in all_companies:
            for q in technical_questions:
                questions_data.append(InterviewQuestion(company_id=company.id, type="technical", question=q))
            for q in coding_questions:
                questions_data.append(InterviewQuestion(company_id=company.id, type="coding", question=q))
            for q in hr_questions:
                questions_data.append(InterviewQuestion(company_id=company.id, type="hr", question=q))
        
        db.session.add_all(questions_data)
        db.session.commit()
        
        print(f"Database seeded successfully with {len(all_companies)} companies and {len(questions_data)} interview questions.")

if __name__ == '__main__':
    seed_data()
