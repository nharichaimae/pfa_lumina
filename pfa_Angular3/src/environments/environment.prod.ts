<<<<<<< HEAD
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  appVersion: '0'
=======
import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true
>>>>>>> e79486fca33179aa8f9fbbceb40c944edddd78fc
};
