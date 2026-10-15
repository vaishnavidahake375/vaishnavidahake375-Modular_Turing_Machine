const sections = [
  ['What is a Turing Machine?', 'A tape of cells, a head that reads and writes one cell at a time, and a finite set of states. At each step the machine looks at its state and the symbol under the head, writes a symbol, moves left or right, and changes state. It stops when it reaches the accept or reject state.'],
  ['What is a subroutine?', 'A named piece of logic that other code can call. A calculator has separate addition, subtraction and multiplication functions; the main program calls the one it needs and carries on afterwards.'],
  ['What is a modular Turing Machine?', 'A Turing Machine split into modules. Each module has one entry state and one exit state. MAIN calls a module, the call is pushed on a stack with a return state, the module runs, and when it reaches its exit state the stack is popped and MAIN resumes at the return state.'],
];
const adv = ['Reusability: FIND_END is written once and called from many places', 'Easier debugging: test one module at a time', 'Easier design and less complexity', 'Better organization and maintenance'];
const lim = ['Extra control logic for calls and returns', 'Module management gets harder as machines grow', 'Harder to implement than a flat table', 'Overhead from switching modules'];

export default function Learn() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4" id="docs">
      <h1 className="text-2xl font-bold">Learn the concept</h1>
      {sections.map(([t, p]) => <section key={t}><h2 className="font-semibold text-cyan-300">{t}</h2><p className="mt-1 leading-relaxed text-slate-300">{p}</p></section>)}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card"><h2 className="mb-2 font-semibold text-green-300">Advantages</h2><ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">{adv.map((a) => <li key={a}>{a}</li>)}</ul></div>
        <div className="card"><h2 className="mb-2 font-semibold text-yellow-300">Limitations</h2><ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">{lim.map((a) => <li key={a}>{a}</li>)}</ul></div>
      </section>
      <section className="card text-sm text-slate-300">
        <h2 className="mb-2 font-semibold">How to read a transition</h2>
        <p>A row <span className="font-mono">q0 | 1 | 1 | S | m1 | FIND_END</span> means: in state q0 reading 1, write 1, stay, then CALL FIND_END and return to m1. A <span className="font-mono">*</span> in Read matches any symbol; in Write it keeps the symbol.</p>
      </section>
    </main>
  );
}
