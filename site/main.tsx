import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./styles/tailwind.css"
import "./styles/init.less"

function boostrap() {
	createRoot(document.getElementById("root") as HTMLElement).render(<App />)
}

boostrap()
