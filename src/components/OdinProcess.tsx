const stages = [
  ["01", "Find the room", "Research the fit: artist, audience, city, and timing."],
  ["02", "Open the door", "A thoughtful first signal starts the conversation."],
  ["03", "Human close", "A real person carries every warm lead to the finish."],
];

export function OdinProcess() {
  return <ol className="process-list">{stages.map(([number, title, copy]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>;
}
