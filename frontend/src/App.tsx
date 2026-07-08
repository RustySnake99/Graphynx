import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Plot from 'react-plotly.js';

function App() {
  const [expression, setExpression] = useState("sin(x)");
  const [points, setPoints] = useState({x: [], y: []});

  async function calculate() {
    const trimmed = expression.trim();

    if (!trimmed) {return;}

    try {
      const response = await fetch("http://localhost:8000/graph", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({expression})
      });

      if (!response.ok) {
        setPoints({x: [], y: []})
        return;
      }

      const data = await response.json();
      setPoints({x: data.x ?? [], y: data.y ?? []});

    } catch (error) {setPoints({x: [], y: []})}
  }

  useEffect(() => {
    const trimmed = expression.trim();
    if (!trimmed) {
      setPoints({x: [], y: []});
      return;
    }
    const timeout = setTimeout(() => {calculate();}, 300);
    return () => clearTimeout(timeout);
  }, [expression]);

  return (
    <>
      <div id='root'>
        <title>Graphynx</title>
        <link rel='icon' type='image/png' href={reactLogo} />
        <div>
          <h1>Graphynx: Graphing Calculator</h1>
          <p>A mini graphing calcuator web app that uses the Python-FastAPI framework in the backend and Typescript + React.js for the frontend. Enter an equation in the input section below and see the plotter show you the graph results
            in realtime as you enter your input. I hope you like using it. Made by Rudraksh. <a href='https://github.com/RustySnake99' target='_blank'>GitHub</a>.
          </p><br />

          <Plot data={[{x: points.x, y: points.y, type:"scatter", mode:"lines"}]} /><br />

          Enter an equation here: <input value={expression} onChange={(e) => setExpression(e.target.value)} placeholder='Enter the equation' />
        </div>
      </div>
    </>
  );
}

export default App
