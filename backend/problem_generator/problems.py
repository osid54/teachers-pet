class MathProblem:
    def __init__(self, question, answer, topic="", num1=None, num2=None, symbol=None):
        self.question = question
        self.answer = answer
        self.topic = topic
        self.num1 = num1
        self.num2 = num2
        self.symbol = symbol

    def to_dict(self):
        return {
            "question": self.question, 
            "answer": self.answer, 
            "topic": self.topic,
            "num1": self.num1,
            "num2": self.num2,
            "symbol": self.symbol
        }