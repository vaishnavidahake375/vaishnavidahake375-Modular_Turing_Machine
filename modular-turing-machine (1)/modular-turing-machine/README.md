# Subroutine-Based / Modular Turing Machine

An interactive simulator that splits a Turing Machine into reusable modules (subroutines) with a real call stack.

## Features
- Real engine: tape, head, transitions, wildcard read/write, 1000-step infinite-loop guard
- Modules with one entry and one exit state; CALL pushes `{module, returnState}`, reaching the exit state pops and returns
- Simulator: animated tape and head, Start/Pause/Resume/Step/Run subroutine/Run full machine/Reset/Stop, call stack, module list, transition table with next-transition highlight, execution history, result card
- 5 example machines (ends with 1, unary increment, contains 1, palindrome, a^n b^n)
- Machine builder (templates, JSON import/export, save to DB), module editor (create/rename/duplicate/delete, transitions, state diagram preview, live validation)
- Dashboard and history (search, filter, sort, delete) backed by the REST API
- Learn page covering concept, advantages and limitations

## Stack
React 18, Vite, Tailwind CSS, Framer Motion, React Icons, React Router - Node, Express, Mongoose (MongoDB optional; falls back to in-memory storage).

## Project structure
```
frontend/src  components/ pages/ services/ utils/ hooks/
backend       config/ controllers/ models/ routes/ services/ middleware/ server.js
```
`frontend/src/utils/turingMachine.js` is the engine. `backend/services/turingMachineService.js` is a copy: re-copy after editing.

## How a modular machine works
A transition `{state, read, write, move, next, call}` with `call: "FIND_END"` writes/moves as usual, pushes `{module: caller, returnState: next}` on the stack, and jumps to FIND_END's entry state. When FIND_END reaches its exit state the frame is popped and the caller resumes at `returnState`. ACCEPT and REJECT modules have no exit state; they move to the halting state. `*` as Read matches any symbol; as Write it keeps the symbol.

## Setup
```bash
cd backend && cp .env.example .env && npm install && npm start     # http://localhost:5000/api
cd frontend && cp .env.example .env && npm install && npm run dev  # http://localhost:5173
cd frontend && npm test                                            # 14 engine tests
```
### MongoDB
Install MongoDB locally or use Atlas, then set `MONGODB_URI` in `backend/.env`. Without it (or if it is unreachable) the API uses in-memory storage and data resets on restart.
### Environment variables
Backend: `PORT`, `MONGODB_URI`, `CLIENT_ORIGIN`. Frontend: `VITE_API_URL`.

## API
- `GET/POST /api/machines`, `GET/PUT/DELETE /api/machines/:id`
- `GET/POST /api/modules`, `GET/PUT/DELETE /api/modules/:id`
- `POST /api/simulations` with `{machineId | machine, input, maxSteps}` runs the machine on the server and stores the result
- `GET /api/simulations`, `GET /api/simulations/stats`, `GET/DELETE /api/simulations/:id`, `DELETE /api/simulations`

## Advantages
Reusability, easier debugging and design, less complexity, better organization and maintenance.
## Limitations
Extra control logic, harder module management, more complex implementation, switching overhead.
## Future scope
AI machine generation, voice explanation, automatic transitions, richer diagrams, collaboration, cloud storage and accounts, PDF export, analytics, quizzes.
## Screenshots
Add screenshots of the simulator, module editor and history here.
## Contributors / License
Add your team names. MIT license.
