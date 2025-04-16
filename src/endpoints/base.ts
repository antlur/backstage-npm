import { BackstageClient } from "../client.js";

export class BaseService {
  constructor(protected client: BackstageClient) {}
}
