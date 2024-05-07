import React, { ReactNode, useContext, useEffect, useState } from "react";
import { dbRef } from "./firebase.ts";
import { child, get } from "firebase/database";

type AuthData = {
	list: string[]
	loading: boolean
}

const AuthContext = React.createContext<AuthData>({
	list: ["empty"],
	loading: true
})

export function useAuth()  {
	return useContext(AuthContext)
}

export function AuthProvider({children}: {children: ReactNode}): JSX.Element {
	const [list, setlist] = useState<string[]>(["empty"]);
	const [loading, setloading] = useState<boolean>(true);

	function getGlobalData() {

		get(child(dbRef, 'list')).then((snapshot) => {
			if (snapshot.exists()) {
				setlist([...snapshot.val()]);
			}
			setloading(false);
		});

	}

	useEffect(() => {
		getGlobalData();
	},[]);


	const value = {
		list,
		loading
	}

	return(
		<AuthContext.Provider value={value}>
			<span>{`${loading}`}</span>

			{!loading && children}
		</AuthContext.Provider>
	)
}

