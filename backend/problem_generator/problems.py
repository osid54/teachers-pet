class MathProblem:
    def __init__(self, question, answer, topic=""):
        self.question = question
        self.answer = answer
        self.topic = topic

    def to_dict(self):
        return {"question": self.question, "answer": self.answer, "topic": self.topic}