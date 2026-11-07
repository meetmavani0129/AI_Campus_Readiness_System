import re

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class CareerChatbot:
    """A lightweight career guidance chatbot.

    This class uses a small in-memory knowledge base and a TF-IDF similarity model
    to match user questions to relevant career domain guidance.
    """

    def __init__(self):
        self.knowledge_base = {
            "web development": (
                "Web development involves building and maintaining websites and web apps. "
                "Key skills include HTML, CSS, JavaScript, responsive design, and frameworks like React or Angular. "
                "Common topics include frontend, backend (Node.js/Python), APIs, and deployment."
            ),
            "data science": (
                "Data science combines statistics, mathematics, and programming to extract insights from data. "
                "Key skills include Python, R, SQL, machine learning, data visualization, and experimentation. "
                "It often involves working with pandas, scikit-learn, and data pipelines."
            ),
            "cloud computing": (
                "Cloud computing involves delivering computing services over the internet. "
                "Key skills include AWS, Azure, Google Cloud, containerization, and DevOps practices. "
                "It includes working with infrastructure as code, serverless, and scalable architectures."
            ),
            "cybersecurity": (
                "Cybersecurity focuses on protecting systems and networks from digital attacks. "
                "Key skills include threat modeling, network security, cryptography, and ethical hacking. "
                "Areas of focus include incident response, security engineering, and compliance."
            ),
            "machine learning": (
                "Machine learning is a subset of AI that focuses on building systems that learn from data. "
                "Key skills include algorithms, neural networks, model evaluation, and Python libraries like TensorFlow or PyTorch. "
                "It involves data preprocessing, feature engineering, and model deployment."
            ),
            "full stack": (
                "Full stack developers work on both the front-end and back-end of applications. "
                "They need to know technologies like React, Node.js, databases, API design, and deployment. "
                "Understanding system architecture and DevOps basics is also helpful."
            ),
            "resume writing": (
                "A strong resume is your first impression. Keep it to one page, use a clean layout, "
                "and focus on quantifiable achievements rather than just listing responsibilities. "
                "Always tailor your skills section to the job description and include links to your GitHub or portfolio."
            ),
            "interview preparation": (
                "For technical interviews, practice data structures and algorithms on LeetCode or HackerRank. "
                "For behavioral interviews, use the STAR format (Situation, Task, Action, Result). "
                "Always research the company beforehand and prepare thoughtful questions to ask the interviewer."
            ),
            "salary negotiation": (
                "Salary negotiation is expected in most tech roles. Before negotiating, research market rates on Glassdoor "
                "or Levels.fyi. Don't be the first to name a number if possible. Focus on your value, and remember you "
                "can also negotiate bonuses, remote work capabilities, and stock options."
            ),
            "networking": (
                "Networking is crucial for finding unlisted opportunities. Optimize your LinkedIn profile, connect with "
                "alumni, attend local tech meetups, and contribute to open-source projects. Sending polite, brief cold messages "
                "to recruiters or engineers at your target companies can also be highly effective."
            ),
            "internships": (
                "Internships are the best way to get practical experience. Start applying early (often in the Fall for Summer roles). "
                "If you can't find a formal internship, focus on building complete, deployed side-projects or contributing to open source."
            ),
            "soft skills": (
                "Technical skills get you the interview, but soft skills get you the job. Communication, teamwork, "
                "adaptability, and problem-solving are critical. Practice explaining complex technical concepts in simple, "
                "easy-to-understand terms."
            ),
            "certifications": (
                "Certifications can help prove your knowledge, especially in Cloud (AWS Solutions Architect, Azure Fundamentals) "
                "and Cybersecurity (CompTIA, CISSP). However, for broad Software Engineering, practical projects often carry "
                "more weight than certificates."
            ),
        }

        # Build a TF-IDF vectorizer over the combined topic+content so that query matching is more flexible.
        self.topics = list(self.knowledge_base.keys())
        self.documents = [f"{topic}. {content}" for topic, content in self.knowledge_base.items()]
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.tfidf_matrix = self.vectorizer.fit_transform(self.documents)

    def _normalize_query(self, query: str) -> str:
        # Minimal cleanup to improve matching
        query = query.strip()
        query = re.sub(r"\s+", " ", query)
        return query

    def _find_best_topic(self, query: str):
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        best_idx = int(np.argmax(similarities))
        return best_idx, float(similarities[best_idx])

    def get_response(self, user_query: str) -> str:
        import random
        
        query = self._normalize_query(str(user_query or ""))

        if not query:
            return (
                "Hi! I'm your career guidance assistant. Ask me about tech domains, "
                "resume writing, interview prep, salary negotiation, or networking."
            )

        lower = query.lower()
        # Only trigger greeting if the query is very short and consists mostly of greeting words
        greetings_list = ["hi", "hello", "hey", "greetings", "good morning", "good afternoon"]
        is_just_greeting = any(lower == g or lower.startswith(g + " ") and len(lower.split()) <= 2 for g in greetings_list)
        
        if is_just_greeting:
            greetings = [
                "Hello! I can help with career guidance, resume tips, and interview prep. Ask me anything!",
                "Hey there! Ready to boost your career? What would you like to know about?",
                "Hi! I'm your AI career coach. Do you have questions about technical domains or job hunting?"
            ]
            return random.choice(greetings)

        # Use TF-IDF similarity to pick the best domain.
        best_idx, score = self._find_best_topic(query)
        best_topic = self.topics[best_idx]
        best_content = self.knowledge_base[best_topic]

        # If the query is not strongly related to any topic, encourage clarification.
        # Lowered threshold from 0.2 to 0.12 to be more forgiving for varying sentences
        if score < 0.12:
            confused_responses = [
                "I didn't quite catch that. Please try asking about a specific topic, like 'Resume tips' or 'What skills do I need for cybersecurity?'.",
                "I'm not quite sure about that. Could you ask about a specific tech domain, interview prep, or networking?",
                "Hmm, I might not have knowledge on that yet. Try asking me about Data Science, Internships, or Salary Negotiation."
            ]
            return random.choice(confused_responses)

        return (
            f"It sounds like you're asking about {best_topic.title()}.\n\n{best_content}\n\n"
            "If you have a follow-up about required skills, learning resources, or interview prep, feel free to ask!"
        )

if __name__ == "__main__":
    bot = CareerChatbot()
    print(bot.get_response("Tell me about web development"))
    print(bot.get_response("How do I write a good resume?"))
    print(bot.get_response("Can you help me negotiate my salary?"))
