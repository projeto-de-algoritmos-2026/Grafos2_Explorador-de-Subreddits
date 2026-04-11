from fastapi import FastAPI
from src.graph import build_graph
from src.service import analyze_subreddit, bfs_influence

app = FastAPI()

G = build_graph([
    "data/soc-redditHyperlinks-body.tsv",
    "data/soc-redditHyperlinks-title.tsv"
])

@app.get("/")
def root():
    return {"message": "Reddit Graph API online"}

@app.get("/subreddit/{name}")
def get_subreddit(name: str):
    return analyze_subreddit(G, name)

@app.get("/influence/{name}")
def get_influence(name: str, depth: int = 1):
    return bfs_influence(G, name, depth)