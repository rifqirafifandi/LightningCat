.PHONY: codegen fmt serve docker-build

codegen:
	datamodel-codegen --input oas.yaml --output src/recommender/model.py --input-file-type openapi --output-model-type pydantic_v2.BaseModel

fmt:
	uvx nb-clean clean notebooks
	uvx ruff format

serve:
	uvicorn recommender.app:app --reload

docker-build:
	docker build --tag recommender .

docker-serve:
	docker run            \
	  --volume .:/app     \
    --volume /app/.venv \
    --publish 8000:8000 recommender
