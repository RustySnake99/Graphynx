from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sympy import symbols, sympify, lambdify
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application
import numpy as np
import re

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
trf = standard_transformations + (implicit_multiplication_application, )

x = symbols("x")
y = symbols("y")

class GraphRequest(BaseModel):
    expression: str

def normalize(eq: str) -> str:
    replacements = {
        "^": "**",
        "arcsin(": "asin(",
        "arccos(": "acos(",
        "arctan": "atan(",
        "ln(": "log(",
        "π": "pi",
        "abs": "Abs",
    }
    for i, j in replacements.items():
        eq = eq.replace(i, j)
    eq = re.sub(r"\|(.*?)\|", r"Abs(\1)", eq)
    
    return parse_expr(eq, transformations=trf)

@app.post("/graph")
def graph(data: GraphRequest):
    try:
        expr = sympify(normalize(data.expression))

        f = lambdify(x, expr, "numpy")
        xs = np.linspace(-10, 10, 1000)
        
        ys = f(xs)
        ys = np.where(np.isfinite(ys), ys, np.nan)
        ys = [None if np.isnan(y) else float(y) for y in ys]

        return {"x": xs.tolist(), "y": ys}
    except:
        return None

@app.get("/")
def root():
    return {"message": "Graphynx API is now active!"}