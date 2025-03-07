from pathlib import Path
from pprint import pp

from recommender.inference import Searcher
from recommender.model import User

INDEX_PATH = Path("output_index/")

searcher = Searcher.from_local_path(INDEX_PATH)

# case 1: user name search
res = searcher.search_user("f0a9d68f-71d3-4d75-abd9-6aea81b5066b")
pp(res)

res = searcher.search_facilities_from_username(
    "f0a9d68f-71d3-4d75-abd9-6aea81b5066b", top_k=5
)
for fa in res:
    f = fa.model_dump()
    print(f"name={f['name']}, location={f['location']}")

print("===============")

user_data = {"location": [1.3644405842316247, 103.85027605828729]}
user_data = {"location": [1.3445342246884915, 103.74810664679934]}
user = User(**user_data)
res = searcher.search_facilities_from_user(user, top_k=5)
for fa in res:
    f = fa.model_dump()
    print(f"name={f['name']}, location={f['location']}")
