export abstract class EnvConfig {
  protected getOptional(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  protected getRequired(value: string | undefined, key: string): string {
    const resolved = this.getOptional(value);
    if (!resolved) {
      throw new Error(`${key} is not set`);
    }
    return resolved;
  }
}
