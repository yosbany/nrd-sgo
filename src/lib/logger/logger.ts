export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export class Logger {
  private static instance: Logger;
  private context: string[] = [];
  private parentId?: string;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private getCurrentContext(): string {
    return this.context.join(' > ');
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const currentContext = this.getCurrentContext();
    const parentInfo = this.parentId ? ` [Parent: ${this.parentId}]` : '';
    const contextInfo = context ? ` ${JSON.stringify(context)}` : '';
    const stackInfo = level === LogLevel.ERROR ? `\nStack: ${new Error().stack}` : '';

    return `[${timestamp}] ${level} ${currentContext}${parentInfo}: ${message}${contextInfo}${stackInfo}`;
  }

  enterContext(context: string): void {
    this.context.push(context);
    this.parentId = this.generateId();
  }

  exitContext(): void {
    this.context.pop();
    this.parentId = undefined;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    // Siempre mostrar errores, incluso en producción
    console.error(this.formatMessage(LogLevel.ERROR, message, context));
  }
} 