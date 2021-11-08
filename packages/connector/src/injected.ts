import { defer, Observable } from "rxjs"
import { forkJoin, from } from "rxjs"
import { map, mergeMap, startWith } from "rxjs/operators"
import type { ConnectionProvider, ConnectionState } from "./provider"

export type EthereumWallet = {
	provider: any
	address: string
	disconnect?: () => void
}

export class InjectedWeb3ConnectionProvider implements ConnectionProvider<"injected", EthereumWallet> {
	readonly connection: Observable<ConnectionState<EthereumWallet>>

	constructor() {
		this.connection = promiseToObservable(getWalletAsync()).pipe(
			map(wallet => {
				if (wallet) {
					return { status: "connected" as const, connection: wallet }
				} else {
					return undefined
				}
			}),
			startWith({ status: "connecting" as const }),
		)
	}

	get options(): Promise<"injected"[]> {
		//todo handle injected provider types (find out what exact provider is used)
		// metamask, dapper etc
		return getInjectedProvider()
			.then(provider => {
				if (provider !== undefined) {
					return ["injected"]
				} else {
					return []
				}
			})
	}

	get isAutoConnected(): Promise<boolean> {
		//todo possibly, will be hard to disconnect from injected providers (metamask)
		// need to check docs
		//todo handle provider not found
		return getInjectedProvider()
			.then(provider => {
				if (provider !== undefined) {
					return getAccounts(provider)
				} else {
					return [] as string[]
				}
			})
			.then(([account]) => account !== undefined)
	}

	connect(): void {
		getInjectedProvider()
			.then(enableProvider)
	}
}

function promiseToObservable<T>(promise: Promise<Observable<T>>): Observable<T> {
	return from(promise).pipe(
		mergeMap(it => it),
	)
}

async function getWalletAsync(): Promise<Observable<EthereumWallet | undefined>> {
	const provider = await getInjectedProvider()
	const address = getAddress(provider)
	return forkJoin({ address }).pipe(
		map(it => {
			if (it.address) {
				return { address: it.address, provider }
			} else {
				return undefined
			}
		}),
	)
}

async function enableProvider(provider: any) {
	//todo check if everything's correct here
	if (typeof provider.request === "function") {
		await provider.request({
			method: "eth_requestAccounts",
		})
	}
	if (typeof provider.enable === "function") {
		await provider.enable()
	}
	return provider
}

function getAddress(provider: any): Observable<string | undefined> {
	return new Observable<string | undefined>(subscriber => {
		function handler(accounts: string[]) {
			if (accounts.length > 0) {
				subscriber.next(accounts[0])
			} else {
				subscriber.next(undefined)
			}
		}
		getAccounts(provider).then(handler)
		provider.on("accountsChanged", handler) //todo if on not supported poll
		subscriber.add(() => {
			provider.removeListener("accountsChanged", handler) //todo if removeListener not supported
		})
	})
}

async function getInjectedProvider(): Promise<any | undefined> {
	if ((window as any).ethereum) {
		return (window as any).ethereum
	} else {
		return new Promise<any | undefined>(resolve => {
			const handleInit = () => {
				const { ethereum } = window as any
				if (ethereum) {
					resolve(ethereum)
				} else {
					resolve(undefined)
				}
			}
			window.addEventListener("ethereum#initialized", handleInit, {
				once: true,
			})
			setTimeout(handleInit, 3000)
		})
	}
}

async function getAccounts(provider: any): Promise<string[]> {
	if ("request" in provider) {
		return provider.request({ method: "eth_accounts" })
	} else {
		return []
	}
}
