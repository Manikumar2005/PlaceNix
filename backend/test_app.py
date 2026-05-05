import unittest
import json
from app import create_app
from database import db
from models import Student, Company

class APITestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()
            
            # Seed test data
            comp = Company(name="Test Corp", role="SDE", package="10 LPA", eligibility_cgpa=7.0, required_skills="Python, React", drive_date="2025-01-01")
            db.session.add(comp)
            db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)

    def test_get_companies(self):
        res = self.client.get('/api/companies')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Test Corp')

    def test_filter_companies(self):
        res = self.client.get('/api/companies/filter?cgpa=8.0&skills=python')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Test Corp')

    def test_add_student(self):
        student_data = {
            "name": "John Doe",
            "cgpa": 8.5,
            "skills": "Python, React, Node",
            "projects": "Placement App",
            "internships": "Summer Intern at Tech Corp"
        }
        res = self.client.post('/api/students', data=json.dumps(student_data), content_type='application/json')
        if res.status_code != 201:
            print("ERROR RESPONSE:", res.data)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertEqual(data['name'], 'John Doe')

if __name__ == '__main__':
    unittest.main()
