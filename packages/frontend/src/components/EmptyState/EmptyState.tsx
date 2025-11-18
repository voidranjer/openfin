export default function EmptyState() {
  return <div className="bg-blue-100 rounded mx-[20px] py-[20px] flex flex-col justify-center align-center text-center space-y-2">

    <h2 className="text-xl font-bold">Unsupported site!</h2>
    <p>Navigate to one of these sites to begin.</p>

    <ul className="list-disc w-fit mx-auto text-start leading-relaxed font-semibold">
      <li>RBC</li>
      <li>Scotiabank Chequing</li>
      <li>Scotiabank Credit</li>
      <li>Wealthsimple</li>
      <li>Rogersbank</li>
    </ul>

  </div>
}
