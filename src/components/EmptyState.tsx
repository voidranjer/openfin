export default function EmptyState() {
  return (
    <div className="flex-grow flex items-center justify-center text-center text-gray-500">
      <div>
        <p>No transactions captured yet.</p>
        <p className="text-sm mt-2">
          Navigate around the website to see transaction data appear here
          automatically.
        </p>
      </div>
    </div>
  );
}
