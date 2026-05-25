# Ilham Journal

React/Vite journal app with Google Sheets sync.

## Local setup

```sh
npm install
npm run dev
```

Google Sheets sync is configured in:

```text
src/services/googleSheets.js
```

The Apps Script must accept these actions:

- `create`
- `update`
- `delete`

Payload shape:

```js
{
  action: 'create',
  entry: {
    id,
    createdAt,
    updatedAt,
    mood,
    body,
  }
}
```
