import pandas as pd
import networkx as nx

def build_graph(paths):
    G = nx.MultiDiGraph()

    for path in paths:
        df = pd.read_csv(path, sep="\t")

        for row in df.itertuples(index=False):
            G.add_edge(
                row.SOURCE_SUBREDDIT,
                row.TARGET_SUBREDDIT,
                sentiment=row.LINK_SENTIMENT,
                timestamp=row.TIMESTAMP
            )

    return G