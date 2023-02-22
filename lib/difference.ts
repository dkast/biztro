import isArray from "lodash.isarray"
import isEqual from "lodash.isequal"
import isObject from "lodash.isobject"
import transform from "lodash.transform"

export default function difference(origObj, newObj) {
  function changes(newObj, origObj) {
    const arrayIndexCounter = 0
    return transform(newObj, function (result, value, key) {
      if (!isEqual(value, origObj[key])) {
        const resultKey = isArray(origObj) ? arrayIndexCounter : key
        result[resultKey] =
          isObject(value) && isObject(origObj[key])
            ? changes(value, origObj[key])
            : value
      }
    })
  }

  return changes(newObj, origObj)
}
