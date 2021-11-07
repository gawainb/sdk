import type { Observable } from "rxjs"
import { BehaviorSubject, of } from "rxjs"
import { map } from "rxjs/operators"
import type { ConnectionProvider } from "./provider"
import { ConnectorImpl } from "./connector"

describe("Connector", () => {
	test("should return options", async () => {
		const connector = new ConnectorImpl<string, string | number>([
			test1, test2,
		])
		expect(await connector.options).toStrictEqual([
			{ provider: test1, option: "test1-op1" },
			{ provider: test1, option: "test1-op2" },
			{ provider: test2, option: "test2-op1" },
		])
	})

	test("should not allow to connect if other connected", async () => {
		const conn1 = new BehaviorSubject<string | undefined>("connected")
		const p1 = createTestProvider(conn1)
		const conn2 = new BehaviorSubject<string | undefined>(undefined)
		const p2 = createTestProvider(conn2)

		const connector = new ConnectorImpl([p1, p2])
		const [opt1, opt2] = await connector.options
		connector.connect(opt1)
		expect(() => connector.connect(opt2)).toThrow()

		conn1.next(undefined)
		expect(() => connector.connect(opt2)).not.toThrow()
		expect(() => connector.connect(opt2)).not.toThrow()
	})
})

const test1: ConnectionProvider<string, string> = {
	options: Promise.resolve(["test1-op1", "test1-op2"]),
	connection: of({ status: "connected", connection: "connected" }),
	connect() {
	},
}

const test2: ConnectionProvider<string, number> = {
	options: Promise.resolve(["test2-op1"]),
	connection: of({ status: "connected", connection: 1 }),
	connect() {
	},
}

function createTestProvider(connection: Observable<string | undefined>): ConnectionProvider<string, string> {
	return {
		options: Promise.resolve(["option"]),
		connection: connection.pipe(map(it => it ? { status: "connected", connection: it } : undefined)),
		connect() {
		},
	}
}
