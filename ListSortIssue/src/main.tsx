import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<AuthProvider>
			<div className="programContainer">
				<div className="appPage">
					<App />
				</div>
			</div>
		</AuthProvider>
	</React.StrictMode>,
)
