
export function Button({ className = '', ...props }) {
  return (
    <button
      className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md ${className}`}
      {...props}
    />
  );
}
