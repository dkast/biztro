import isArray from "lodash.isarray"
import isEqual from "lodash.isequal"
import isObject from "lodash.isobject"
import transform from "lodash.transform"

export default function difference(
  origObj: { [x: string]: unknown },
  newObj: { [x: string]: unknown }
) {
  function changes(
    newObj: { [x: string]: unknown },
    origObj: { [x: string]: unknown }
  ) {
    const arrayIndexCounter = 0
    return transform(
      newObj,
      function (
        result: { [x: string]: unknown },
        value: unknown,
        key: string | number
      ) {
        if (!isEqual(value, origObj[key])) {
          const resultKey = isArray(origObj) ? arrayIndexCounter : key
          result[resultKey] =
            isObject(value) && isObject(origObj[key])
              ? changes(
                  value as { [x: string]: unknown },
                  origObj[key] as { [x: string]: unknown }
                ) // Added index signature to the type declaration
              : value
        }
      }
    )
  }

  return changes(newObj, origObj)
}
