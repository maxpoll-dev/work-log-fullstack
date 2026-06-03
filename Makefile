COMPOSE := docker compose

.PHONY: up down build rebuild logs ps restart migrate seed reset sh-api sh-web db clean

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build

rebuild:
	$(COMPOSE) build --no-cache

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

restart:
	$(COMPOSE) restart api web

migrate:
	$(COMPOSE) up api-migrate

seed:
	$(COMPOSE) run --build --rm api-seed

reset:
	$(COMPOSE) down -v
	$(COMPOSE) up -d --build
	$(COMPOSE) run --build --rm api-seed

sh-api:
	$(COMPOSE) exec api sh

sh-web:
	$(COMPOSE) exec web sh

db:
	$(COMPOSE) exec mysql sh -c 'mysql -u$$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE'

clean:
	$(COMPOSE) down -v
