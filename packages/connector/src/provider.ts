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
 * Provider of the connection.
 * Examples: injected web3, fortmatic, temple tezos wallet, blocto.
 */
export type ConnectionProvider<Option, Connection> = {
	/**
	 * Checks if this provider is auto-connected. For example, injected mobile providers are connected by default
	 */
	isAutoConnected: Promise<boolean>
	/**
	 * List of available connection options: injected web3 can find out what option is available (Metamask, Trust etc.)
	 */
	options: Promise<Option[]>
	/**
	 * Start connection using specified option
	 * @param option selected connection option
	 */
	connect(option: Option): void
	/**
	 * Current connection state. If value is undefined, then provider is considered disconnected.
	 */
	connection: Observable<ConnectionState<Connection>>
}
