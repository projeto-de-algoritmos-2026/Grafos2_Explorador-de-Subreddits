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

def bfs_influence(G, subreddit, max_depth=2):
    if subreddit not in G:
        return {"error": "Subreddit não encontrado"}

    visited = set()
    queue = [(subreddit, 0)]

    result = []

    while queue:
        current, depth = queue.pop(0)

        if depth >= max_depth:
            continue

        for neighbor in G.predecessors(current):
            if neighbor not in visited:
                visited.add(neighbor)

                result.append({
                    "subreddit": neighbor,
                    "depth": depth + 1
                })

                queue.append((neighbor, depth + 1))

    return {
        "target": subreddit,
        "max_depth": max_depth,
        "nodes_found": len(result),
        "influence": result
    }