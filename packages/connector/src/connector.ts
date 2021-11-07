import type { Observable } from "rxjs"
import { Atom } from "@rixio/atom"
import { mergeMap } from "rxjs/operators"
import { of } from "rxjs"
import type { ConnectionProvider, ConnectionState } from "./provider"

export type ProviderOption<Option, Connection> = {
	provider: ConnectionProvider<Option, Connection>
	option: Option
}

//todo how to support auto connect
//todo Metamask for example, check if already connected, or other injected wallets - on mobile
export type Connector<Option, Connection> = {
	options: Promise<ProviderOption<Option, Connection>[]>
	connect(option: ProviderOption<Option, Connection>): void
	connection: Observable<ConnectionState<Connection>>
}

export class ConnectorImpl<Option, Connection> implements Connector<Option, Connection> {
	private readonly provider: Atom<ConnectionProvider<Option, Connection> | undefined> = Atom.create(undefined)
	readonly connection: Observable<ConnectionState<Connection>>
	readonly close: () => void

	constructor(
		private readonly providers: ConnectionProvider<Option, Connection>[],
	) {
		this.connection = this.provider.pipe(
			mergeMap(p => p ? p.connection : of(undefined)),
		)
		const sub = this.connection.subscribe(c => {
			if (c === undefined) {
				this.provider.set(undefined)
			}
		})
		this.close = sub.unsubscribe
	}

	get options(): Promise<ProviderOption<Option, Connection>[]> {
		return this.getOptions()
	}

	private async getOptions(): Promise<ProviderOption<Option, Connection>[]> {
		const result: ProviderOption<Option, Connection>[] = []
		for (const pair of this.providers.map(it => ({ provider: it, options: it.options }))) {
			const { provider, options } = pair
			for (const option of await options) {
				result.push({ provider, option })
			}
		}
		return result
	}

	connect(option: ProviderOption<Option, Connection>): void {
		const connected = this.provider.get()
		if (connected !== undefined) {
			throw new Error(`Provider ${connected} already connected`)
		}
		option.provider.connect(option.option)
		this.provider.set(option.provider)
		//todo watch provider connection and reset this.provider Atom if disconnected
	}
}
