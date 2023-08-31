# everything phony
.PHONY: $(shell grep --no-filename -E '^([a-zA-Z_-]|/)+:' $(MAKEFILE_LIST) | sed 's/:.*//')

docker/up:
	docker compose up -d
	docker compose run --rm dockerize -wait tcp://postgres:5432

docker/down:
	docker compose down

docker/clean:
	docker compose down -v --remove-orphans
	docker compose rm -f -s -v

db/reset:
	docker compose exec -T postgres psql postgres postgres -c 'DROP DATABASE IF EXISTS "development"' -c 'CREATE DATABASE "development"'
	pnpm migrate init-latest
