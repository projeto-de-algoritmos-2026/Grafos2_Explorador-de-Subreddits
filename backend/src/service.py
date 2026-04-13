from pyvis.network import Network
from math import pi, cos, sin
import webbrowser
import os


def analyze_subreddit(G, subreddit):
    if subreddit not in G:
        return {"error": "Subreddit não encontrado"}

    incoming_edges = G.in_edges(subreddit, data=True)

    total = 0
    positive = 0
    negative = 0

    sources = {}

    for source, _, data in incoming_edges:
        total += 1

        sentiment = data["sentiment"]

        if sentiment == 1:
            positive += 1
        elif sentiment == -1:
            negative += 1

        sources[source] = sources.get(source, 0) + 1

    top_sources = sorted(sources.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "subreddit": subreddit,
        "total_mentions": total,
        "positive": positive,
        "negative": negative,
        "positivity_ratio": positive / total if total > 0 else 0,
        "top_sources": top_sources
    }

def bfs_influence_with_sentiment(G, subreddit, max_depth=2):
    if subreddit not in G:
        return {"error": "Subreddit não encontrado"}

    visited = set([subreddit])
    queue = [(subreddit, 0)]

    result = []

    total_positive = 0
    total_negative = 0

    while queue:
        current, depth = queue.pop(0)

        if depth >= max_depth:
            continue

        for neighbor in G.predecessors(current):
            edges = G.get_edge_data(neighbor, current)

            for edge in edges.values():
                sentiment_value = edge.get("sentiment", 0)

                if sentiment_value == 1:
                    sentiment = "positive"
                    total_positive += 1
                elif sentiment_value == -1:
                    sentiment = "negative"
                    total_negative += 1
                else:
                    sentiment = "neutral"

                result.append({
                    "source": neighbor,
                    "target": current,
                    "depth": depth + 1,
                    "sentiment": sentiment
                })

            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, depth + 1))

    total = total_positive + total_negative

    return {
        "target": subreddit,
        "max_depth": max_depth,
        "edges_found": len(result),
        "positive": total_positive,
        "negative": total_negative,
        "negativity_ratio": total_negative / total if total > 0 else 0,
        "edges": result
    }

def get_node_color(pos, neg):
    if pos > neg:
        return "green"
    elif neg > pos:
        return "red"
    else:
        return "gray"

def visualize_bfs(G, subreddit):
    if subreddit not in G:
        return {"error": "Subreddit não encontrado"}

    net = Network(height="1000px", width="100%", directed=True)

    net.set_options("""
    {
      "physics": {
        "enabled": false
      }
    }
    """)

    neighbors = list(G.predecessors(subreddit))
    n = len(neighbors)

    net.add_node(
        subreddit,
        label=subreddit,
        color="blue",
        size=40,
        x=0,
        y=0,
        fixed=True,
        font={"size": 20}
    )

    radius = 500

    for i, neighbor in enumerate(neighbors):
        angle = 2 * pi * i / n

        x = radius * cos(angle)
        y = radius * sin(angle)

        net.add_node(
            neighbor,
            label=neighbor,
            color="#58B0F9",
            size=25,
            x=x,
            y=y,
            fixed=True,
            font={"size": 16}
        )

    for neighbor in neighbors:
        edges = G.get_edge_data(neighbor, subreddit)

        for edge in edges.values():
            sentiment_value = edge.get("sentiment", 0)

            edge_color = "green" if sentiment_value == 1 else "red"

            net.add_edge(
                neighbor,
                subreddit,
                color=edge_color,
                width=2
            )

    output_dir = "backend"
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, f"bfs_{subreddit}.html")

    net.write_html(output_path)

    webbrowser.open(f"file://{os.path.abspath(output_path)}")

    return output_path