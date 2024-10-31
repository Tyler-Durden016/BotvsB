import { BotKind, ComponentDict, DetectorResponse, State } from '../types'

export function detectDistinctiveProperties({ distinctiveProps }: ComponentDict): DetectorResponse {
  if (distinctiveProps.state !== State.Success) return false
  const value = distinctiveProps.value
  let bot: keyof typeof value  // Ensures 'bot' is treated as a key of 'value'
  for (bot in value) {
    if (value[bot]) return bot as BotKind  // Ensure to cast the return value to 'BotKind'
  }
  return false  // If no bot is detected
}
