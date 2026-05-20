# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/03/15 19:06:56 by daeunki2          #+#    #+#              #
#    Updated: 2026/05/14 17:59:11 by daeunki2         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

NAME = transcendence
COMPOSE = docker compose

all: up

up-core:
	@echo "1. Starting core infra (db/redis)"
	$(COMPOSE) up -d auth-database user-database chat-database game-database redis chat-redis

up-auth-user:
	@echo "2. Starting auth/user services"
	$(COMPOSE) up -d auth-service user-service

up-app:
	@echo "3. Starting app services"
	$(COMPOSE) up --no-deps -d gateway chat-service game-service frontend
	$(COMPOSE) up -d --no-deps uptime-kuma

up: up-core up-auth-user up-app
	@echo "4. All services started 🚀"

up-build: build up

down:
	@echo "Stopping containers 🛑"
	$(COMPOSE) down

build:
	@echo "Building containers 🛠️"
	$(COMPOSE) build

start:
	$(COMPOSE) start

stop:
	$(COMPOSE) stop

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

clean:
	@echo "Removing containers and volumes 🧹"
	$(COMPOSE) down -v

fclean: clean
	@echo "Pruning docker system 🧹"
	docker system prune -af

re: fclean up

.PHONY: all up up-core up-auth-user up-app up-build down build start stop restart logs ps clean fclean re
