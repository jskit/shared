// utils

import { isObject, isArray } from './is';

// '_~0123456789' +
// 'abcdefghijklmnopqrstuvwxyz' +
// 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const randomString =
  '_~getRandomVcryp0123456789bfhijklqsuvwxzABCDEFGHIJKLMNOPQSTUWXYZ';

export function uuid(size = 21) {
  const url = randomString;
  let id = '';
  let bytes = [];
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    bytes = crypto.getRandomValues(new Uint8Array(size));
    // console.warn(':::uuid crypto:', bytes.join(','));
  } else {
    bytes = random(size);
    // console.warn(':::uuid random:', bytes.join(','));
  }
  // const bytes = typeof crypto !== 'undefined' && crypto.getRandomValues ?
  //   crypto.getRandomValues(new Uint8Array(size)) :
  //   random(size);
  while (0 < size--) {
    id += url[bytes[size] & 63];
  }
  return id;
}

/**
 * Create a cached version of a pure function.
 */
export function cached(fn) {
  const cache = Object.create(null);
  return function cachedFn(str) {
    const hit = cache[str];
    /* eslint no-return-assign: 0 */
    return hit || (cache[str] = fn(str));
  };
}

/**
 * looseEqual
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 *
 * @export
 * @param {*} a 比较值1
 * @param {*} b 比较值2
 * @returns {boolean} 布尔值
 */
export function looseEqual(a, b) {
  if (a === b) return true;
  const isObjectA = isObject(a);
  const isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      const isArrayA = isArray(a);
      const isArrayB = isArray(b);
      if (isArrayA && isArrayB) {
        return (
          a.length === b.length &&
          a.every((e, i) => {
            return looseEqual(e, b[i]);
          })
        );
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
      } else if (!isArrayA && !isArrayB) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        return (
          keysA.length === keysB.length &&
          keysA.every(key => {
            return looseEqual(a[key], b[key]);
          })
        );
      } else {
        /* istanbul ignore next */
        return false;
      }
    } catch (e) {
      /* istanbul ignore next */
      return false;
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b);
  } else {
    return false;
  }
}

export function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

export function throttle(func, wait, options) {
  let context;
  let args;
  let result;
  let timeout = null;
  let previous = 0;

  if (!options) options = {};
  const later = () => {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) {
      context = args = null;
    }
  };

  return (...rest) => {
    const now = Date.now();
    if (!previous && options.leading === false) previous = now;
    const remaining = wait - (now - previous);
    context = this;
    args = rest;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) {
        context = args = null;
      }
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

export function debounce(func, wait, immediate) {
  let timeout;
  let args;
  let context;
  let timestamp;
  let result;

  const later = () => {
    const last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return (...rest) => {
    context = this;
    args = rest;
    timestamp = Date.now();
    const callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

// 以下简单转化命名格式

/**
 * Camelize a hyphen-delimited string.
 * camelCase 小驼峰命名
 */
const camelizeRE = /-(\w)/g;
const camelize = cached(function(str) {
  /* eslint func-names: 0 */
  return str.replace(camelizeRE, function(_, c) {
    return c ? c.toUpperCase() : '';
  });
});

/**
 * Converts the first character of string to upper case.
 * 首字母大写
 */
const capitalize = cached(function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

/**
 * Hyphenate a camelCase string.
 * kebabCase 连字符命名 eg: kebab-case
 */
const hyphenateRE = /\B([A-Z])/g;
export const hyphenate = cached(function(str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase();
});

export const upperFirst = capitalize;
export const kebabCase = hyphenate;
export const camelCase = camelize;

export function merge(target) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    const source = arguments[i] || {};
    for (const prop in source) {
      if (source.hasOwnProperty(prop)) {
        const value = source[prop];
        if (value !== undefined) {
          target[prop] = value;
        }
      }
    }
  }

  return target;
}

/**
 * 新版本返回 true
 *
 * @export
 * @param {*} newVersion 新版本
 * @param {*} oldVersion 老版本
 * @returns {boolean} 布尔值
 */
export function versionCompare(newVersion, oldVersion) {
  const newVersionArr = newVersion.split('.');
  const oldVersionArr = oldVersion.split('.');
  for (let i = 0; i < newVersionArr.length; i++) {
    if (newVersionArr[i] > oldVersionArr[i]) {
      return true;
    }
  }
  return false;
}
