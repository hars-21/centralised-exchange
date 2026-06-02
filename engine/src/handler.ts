import type { EngineRequest } from "./types/engine";

export function handleEngineRequest(message: EngineRequest) {
	if (message.type == "create_order") {
	} else if (message.type == "get_depth") {
	} else if (message.type == "get_user_balance") {
	} else if (message.type == "get_order") {
	} else if (message.type == "cancel_order") {
	}
}
