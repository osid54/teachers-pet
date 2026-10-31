class MathProblem:
    def __init__(self, question, answer, topic="", num1=None, num2=None, symbol=None,
                 display_num1=None, display_num2=None, display_answer=None):
        self.question = question
        self.answer = answer
        self.topic = topic
        self.num1 = num1
        self.num2 = num2
        self.symbol = symbol
        self.display_num1 = display_num1
        self.display_num2 = display_num2
        self.display_answer = display_answer

    def to_dict(self):
        return {
            "question": self.question, 
            "answer": self.answer, 
            "topic": self.topic,
            "num1": self.num1,
            "num2": self.num2,
            "symbol": self.symbol,
            "display_num1": self.display_num1,
            "display_num2": self.display_num2,
            "display_answer": self.display_answer,
        }