import random as r
class numGen:
    def __init__(self, modifiers):
        digits = modifiers.get("digits", 1)
        neg = modifiers.get("neg", 0)
        dec = modifiers.get("dec", 0)
        frac = modifiers.get("frac", False)
        max = int("9" * digits) if digits > 0 else 0
        num = r.randint(0, max)
        if r.random() < .25 * neg: #0 none, 1 some, 2 half, 3 most, 4 all
            num *= -1
        if dec > 0:
            decMax = 0
            for i in range(dec):
                decMax = decMax * 10 + 9
            num += r.randint(0, decMax)/pow(10, dec)
        self.num = num