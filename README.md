# debtmates-ecs-aws


1. Dockerise app
- had issues with npm install stage. Fixed by removing important files from dockerignore

- issue with env variables. Created docker compose and put in values
- same issue, instead of passing the vars during runetime, it needs them at build time. 

screenshots:
    - shows dockerfile
    - shows healthroute status ok
    - 


















---

# Directory structure
```
/
├── app/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── docker-compose.yaml
│   ├── terraform.tfvars
│   └── app source code...
├── .gitignore
└── README.md
```