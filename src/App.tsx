import { useEffect } from 'react'
import './App.css'

export default function App() {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      console.log("App received message:", event);
    }
    
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [])

  return (
    <div className="py-5 px-2">
      {/* <div className="bg-red-200"> */}
      <h1 className="text-3xl font-bold">
          OpenFin
      </h1>
      {/* </div> */}
    </div>
  )
}
