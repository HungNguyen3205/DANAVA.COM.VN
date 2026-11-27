self.__MIDDLEWARE_MATCHERS = [
  {
    "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/|assets\\/|api\\/|admin|favicon|icon|robots|sitemap|.*\\.[a-zA-Z0-9]{2,5}$).*))(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$",
    "originalSource": "/((?!_next/|assets/|api/|admin|favicon|icon|robots|sitemap|.*\\.[a-zA-Z0-9]{2,5}$).*)"
  }
];self.__MIDDLEWARE_MATCHERS_CB && self.__MIDDLEWARE_MATCHERS_CB()