# backend

Fastify API for [magazineguessr.com](https://magazineguessr.com). Runs on AWS Lambda behind API Gateway.

---

## What it does

This API serves the daily selection, scores guesses, and exposes an admin interface for loading content.

---

## Stack

Node 22, Fastify v5, DynamoDB via AWS SDK v3, `@fastify/aws-lambda` for the Lambda adapter. TypeScript throughout, compiled to `dist/` before packaging. Tests run with Vitest.

---

## Running locally

Create a `.env` at the project root:

```
TABLE_NAME=magazines-daily
ADMIN_KEY=whatever
AWS_REGION=eu-central-1
```

Then:

```bash
npm install
npm run dev
```

That boots the server on `http://localhost:3000`.

---

## API

Check the [API documentation](./api.md)

---

## Tests

```bash
npm test
```