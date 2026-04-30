# Clinic Room Display

Plataforma SaaS inicial para clínicas pequenas e médias exibirem informações de salas médicas em tablets posicionados nas portas dos consultórios.

## Stack

- Frontend: Next.js + React + TypeScript + TailwindCSS
- Backend: Node.js + Express + Socket.IO
- Banco: PostgreSQL
- ORM: Prisma
- Infra: Docker Compose

## Como rodar

```bash
cp .env.example .env
docker compose up -d --build
```

Depois rode o seed dentro do container backend:

```bash
docker compose exec backend npx prisma db seed
```

Acesse:

- Painel: http://localhost:3000/login
- API: http://localhost:4000/health

Credenciais iniciais padrão:

- E-mail: `admin@clinic.local`
- Senha: `admin123456`

Você pode alterar isso no `.env` antes do seed.

## Rotas principais

- `/login`
- `/admin/dashboard`
- `/admin/doctors`
- `/admin/rooms`
- `/admin/devices`
- `/display/[deviceCode]`

Exemplo de display inicial:

```text
http://localhost:3000/display/tablet-sala-1
```

## Funcionamento

1. Cadastre médicos.
2. Cadastre salas.
3. Vincule um médico à sala.
4. Cadastre tablets/dispositivos.
5. Vincule o tablet a uma sala.
6. Abra `/display/CODIGO_DO_TABLET` no tablet.
7. Altere o status da sala no painel administrativo.
8. A tela do tablet atualiza em tempo real.

## Status de sala

- `AVAILABLE`: Disponível
- `IN_SERVICE`: Em atendimento
- `PAUSED`: Em pausa
- `CLOSED`: Encerrado
- `UNAVAILABLE`: Indisponível

## Segurança

Esta é uma versão inicial funcional. Para produção, recomenda-se:

- configurar HTTPS;
- trocar `JWT_SECRET`;
- usar domínio próprio;
- restringir CORS;
- configurar backup do PostgreSQL;
- adicionar controle multi-clínica;
- criar política de retenção de logs;
- validar tamanho e extensão de uploads.

## Atualização desta versão

Esta versão inclui:

- Exclusão de tablets pela tela **Tablets**.
- Edição e exclusão/desativação de salas pela tela **Salas**.
- Tema visual refinado no painel administrativo.
- Nova página **Relatórios** com resumo operacional.
- Download de relatório em PDF pela rota `/api/reports/summary.pdf`.
- Backend ajustado para usar `node:20` baseado em Debian, evitando incompatibilidades entre Prisma, Alpine e OpenSSL.

Após atualizar, reconstrua os containers:

```bash
sudo docker compose down
sudo docker compose up -d --build
```

Se tiver alterado estrutura do banco ou quiser limpar ambiente de desenvolvimento:

```bash
sudo docker compose down -v
sudo docker compose up -d --build
```
