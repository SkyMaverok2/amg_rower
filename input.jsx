
export function Input({ className = '', ...props }) {
  return (
    <input
      className={`border border-gray-300 px-3 py-2 rounded-md w-full ${className}`}
      {...props}
    />
  );
}
