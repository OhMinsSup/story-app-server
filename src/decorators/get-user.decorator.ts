import { createParamDecorator } from '@nestjs/common';

/**
 * Route handler parameter decorator.  Extracts all cookies, or a
 * named cookie from the `cookies` object and populates the decorated
 * parameter with that value.
 *
 * @param data (optional) string containing name of cookie to extract
 * If omitted, all cookies will be extracted.
 */
export const User = createParamDecorator((data, req) => {
  console.log(req);
  return req.user;
});
