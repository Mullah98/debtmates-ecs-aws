# debtmates-ecs-aws


1. Dockerise app
- had issues with npm install stage. Fixed by removing important files from dockerignore

- issue with env variables. Created docker compose and put in values
- same issue, instead of passing the vars during runetime, it needs them at build time. 