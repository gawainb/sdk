import type { Observable } from "rxjs"

export type StateConnected<T> = {
	status: "connected"
	connection: T
}

export type StateConnecting = {
	status: "connecting"
}

export type ConnectionState<T> = StateConnected<T> | StateConnecting | undefined

/**
 * Provider of the connection to wallet.
 */
export type ConnectionProvider<Option, Connection> = {
	options: Promise<Option[]>
	connect(option: Option): void
	connection: Observable<ConnectionState<Connection>>
}
