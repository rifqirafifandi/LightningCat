from pprint import pp
from pathlib import Path
from recommender.inference import Searcher

INDEX_PATH = Path("output_index/")

searcher = Searcher.from_local_path(INDEX_PATH)

# case 1: user name search
res = searcher.search_user("f0a9d68f-71d3-4d75-abd9-6aea81b5066b")
pp(res)

res = searcher.search_facilities_from_user(
    "f0a9d68f-71d3-4d75-abd9-6aea81b5066b", top_k=5
)
for f in res:
    print(f"name={f['name']}, location={f['location']}")
