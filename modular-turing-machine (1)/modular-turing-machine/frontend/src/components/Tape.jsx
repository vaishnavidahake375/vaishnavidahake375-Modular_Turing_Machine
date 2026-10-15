import { useEffect, useRef } from 'react';
import TapeCell from './TapeCell.jsx';

/** Shows the tape (with 3 blank cells of padding either side) and keeps the head in view. */
export default function Tape({ tape, head }) {
  const headRef = useRef(null);
  useEffect(() => { headRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }, [head, tape.length]);
  const pad = ['B', 'B', 'B'];
  const cells = [...pad, ...tape, ...pad];
  return (
    <div className="overflow-x-auto rounded-lg bg-navy-950 p-3" aria-label="Turing machine tape">
      <div className="flex w-max gap-1.5">
        {cells.map((s, i) => {
          const idx = i - 3;
          return <TapeCell key={i} ref={idx === head ? headRef : null} symbol={s} index={idx} active={idx === head} />;
        })}
      </div>
    </div>
  );
}
