/* eslint-disable @typescript-eslint/no-explicit-any */
export default interface Route {
  method: string;
  route: string;
  controller: any;
  action: string;
}
