import { useEffect, useMemo } from 'react';
import { Logger } from './logger';

export function useLogger(componentName: string) {
  const logger = Logger.getInstance();

  useEffect(() => {
    logger.enterContext(componentName);
    logger.debug(`Component ${componentName} mounted`);

    return () => {
      logger.debug(`Component ${componentName} unmounted`);
      logger.exitContext();
    };
  }, [componentName, logger]);

  const log = useMemo(() => ({
    debug: (message: string, context?: Record<string, unknown>) => {
      logger.debug(message, context);
    },
    info: (message: string, context?: Record<string, unknown>) => {
      logger.info(message, context);
    },
    warn: (message: string, context?: Record<string, unknown>) => {
      logger.warn(message, context);
    },
    error: (message: string, context?: Record<string, unknown>) => {
      logger.error(message, context);
    }
  }), [logger]);

  return log;
} 