import random as r
class numGen:
    def __init__(self, modifiers):
        digits = modifiers.get("digits", 1)
        neg = modifiers.get("neg", 0)
        dec = modifiers.get("dec", 0)
        #frac = modifiers.get("frac", False)
        max = (10 ** digits) - 1 if digits > 0 else 0
        if digits == 0: 
            max = 9
        intPart = r.randint(0, max)
        if r.random() < .25 * neg: #0:0%, 1:25%, 2:50%, 3:75%, 4:100%
            if intPart != 0:
                intPart *= -1
        decPart = 0.0
        if dec > 0:
            decMax = (10 ** dec) - 1
            decPart = float(r.randint(0, decMax)) / (10**dec)
        sign = 1 if intPart >= 0 else -1
        calcNum = intPart + decPart * sign
        if dec == 0:
            self.num = int(calcNum)
        else:
            self.num = calcNum
