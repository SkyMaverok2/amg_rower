
export function Dialog({ children }) {
  return <div>{children}</div>;
}

export function DialogTrigger({ children }) {
  return children;
}

export function DialogContent({ children }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white text-black p-6 rounded-xl w-96">{children}</div>
    </div>
  );
}
