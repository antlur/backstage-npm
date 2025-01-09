import { BackstageClient } from "../client";

export class BaseService {
  constructor(protected client: BackstageClient) {}
}
