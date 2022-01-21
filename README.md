# Mplify

## Dev environment

**Start the stack**

```bash
docker-compose -f dev-mplify-compose.yml up
## Hvis du gjør endringer må du av og til legge til --force-recreate eller --build på slutten
```

**Mailhog Web UI**: localhost:8025

Username: dev \
Password: dev

**Adminer DB UI**: localhost:8080

Username: user \
Password: user

**Mplify web UI**: localhost

- localhost/#/registration
- localhost/#/login
- localhost/#/admin

Username: admin \
Password: admin

** Take down the stack**

```bash
docker-compose -f dev-mplify-compose.yml down && docker volume prune
## Databasen blir cacha så kan slette av og til
```

### Cleanup

Remove networks, volumes and cached images.

```bash
docker system prune
```
