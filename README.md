# Task API with SQLite — FlyRank BE-02

This project updates the first Task API assignment by replacing the in-memory task list with SQLite. The API keeps the same endpoints, while task data is saved in `tasks.db` and remains available after the server restarts.

## Stack

- Node.js and Express
- SQLite using `better-sqlite3`
- Swagger UI for interactive API documentation

## Install and run

Install Node.js 18 or newer, then run:

```bash
npm install
npm start
```

The server starts at `http://localhost:3000`. Swagger documentation is available at `http://localhost:3000/docs`.

On first startup, the application creates `tasks.db`, creates the `tasks` table if needed, and inserts three example tasks only if the table is empty.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/tasks` | List tasks |
| GET | `/tasks/:id` | Retrieve one task |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update title and/or completion status |
| DELETE | `/tasks/:id` | Delete a task |

## Example requests

```bash
curl -i http://localhost:3000/tasks
```

```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk"}'
```

```bash
curl -i -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"done":true}'
```

```bash
curl -i -X DELETE http://localhost:3000/tasks/1
```

## SQL queries to try

Open `tasks.db` with DB Browser for SQLite and run:

```sql
SELECT * FROM tasks;
SELECT * FROM tasks WHERE done = 1;
SELECT COUNT(*) FROM tasks;
```

Try changing a row in the database viewer and then refresh `GET /tasks` to confirm that the API reflects the database contents.

## Testing checklist

- [ ] Start the application and confirm `tasks.db` is created.
- [ ] Confirm the `tasks` table and three initial tasks exist.
- [ ] Restart the server and confirm seed tasks are not duplicated.
- [ ] Test list, retrieve, create, update, and delete.
- [ ] Confirm created tasks still exist after restarting the server.
- [ ] Confirm invalid titles return `400` and unknown IDs return `404`.
- [ ] Test the full CRUD flow using Swagger UI.
- [ ] Save your own database viewer screenshot as `screenshots/database.png`.
- [ ] Add real test output and the screenshot before submitting.

## Why SQLite?

SQLite stores data in one local file and does not require a separate database server. It is a simple way to learn persistence and SQL while keeping the API easy to run.

## Git commits

Make meaningful commits as you finish each stage. Do not create fake historical commits or claim work you have not tested.

Suggested commit messages:
1. `Stage 0: create SQLite database`
2. `Stage 1: database read endpoints`
3. `Stage 2: insert into database`
4. `Stage 3: update and delete with SQL`
5. `Stage 4: explored SQLite`
6. `Stage 5: database documentation`

## Notes

The database file is created in the working directory when the server starts. Back up `tasks.db` if you want to keep the data. Review and test the code locally, then update this README with the actual screenshots and outputs from your run.
