export type AppType = 'client' | 'staff';

export function getAppType(): AppType {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    if (hostname.startsWith('staff.') || hostname === 'staff.laserworks.ru') {
      return 'staff';
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const port = window.location.port;
      if (port === '5174' || port === '4174') {
        return 'staff';
      }
    }
  }

  return 'client';
}

export const APP_TYPE: AppType = getAppType();
export const IS_STAFF = APP_TYPE === 'staff';
export const IS_CLIENT = APP_TYPE === 'client';


