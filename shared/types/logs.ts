export type WideEventOutcome = "success" | "error" | "canceled"

export type WideEventKind = "request" | "ui" | "system"

export type WideEventHttp = {
  method?: string;
  path?: string;
  status_code?: number;
  user_agent?: string;
  client_ip?: string;
  route_name?: string;
}

export type WideEventAuth = {
  user_id?: string;
  session_id?: string;
  role?: string | null;
  method?: string;
}

export type WideEventOp = {
  name?: string;
  entity?: string;
  entity_id?: string | string[];
  count?: number;
}

export type WideEventError = {
  type?: string;
  message?: string;
  code?: string | number;
}

export type WideEventDb = {
  duration_ms?: number;
  ops?: number;
  tx?: boolean;
}

export type WideEventEmail = {
  provider?: string;
  template?: string;
  success?: boolean;
}

export type WideEventUi = {
  action?: string;
  route?: string;
  store?: string;
  client_event_id?: string;
}

export type WideEvent = {
  ts: string;
  service: string;
  env: string;
  version: string;
  request_id: string;
  kind: WideEventKind;
  outcome?: WideEventOutcome;
  duration_ms?: number;
  http?: WideEventHttp;
  auth?: WideEventAuth;
  op?: WideEventOp;
  error?: WideEventError;
  db?: WideEventDb;
  email?: WideEventEmail;
  ui?: WideEventUi;
  meta?: Record<string, unknown>;
}
