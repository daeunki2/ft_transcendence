# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/03/15 19:06:56 by daeunki2          #+#    #+#              #
#    Updated: 2026/03/15 19:06:58 by daeunki2         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

NAME = transcendence
COMPOSE = docker compose

all: up

up:
	@echo "Starting $(NAME) 🚀"
	$(COMPOSE) up --build

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

.PHONY: all up down build start stop restart logs ps clean fclean re