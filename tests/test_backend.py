import unittest

from backend.app import create_app


class BackendSmokeTest(unittest.TestCase):
    def setUp(self):
        self.app = create_app().test_client()

    def test_predict_endpoint(self):
        resp = self.app.post('/api/predict', json={
            'cgpa': 8.0,
            'programming': 70,
            'technical': 65,
            'communication': 70,
            'projects': 2,
            'internships': 1,
            'certifications': 1,
            'skills': 'python, sql',
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertIn('readiness_score', data)
        self.assertIn('recommended_domain', data)

    def test_chatbot_endpoint(self):
        resp = self.app.post('/api/chatbot', json={'query': 'Tell me about web development'})
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data.get('status'), 'success')
        self.assertIn('answer', data)
        self.assertIsInstance(data.get('answer'), str)


if __name__ == '__main__':
    unittest.main()
