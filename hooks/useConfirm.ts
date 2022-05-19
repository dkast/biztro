// import { useState, useEffect } from "react"
import { useRecoilState } from "recoil"

import { confirmState } from "@/lib/store"

const useConfirm = () => {
  const [confirm, setConfirm] = useRecoilState(confirmState)
  // const [needsCleanup, setNeedsCleanup] = useState(false)
  const isConfirmed = prompt => {
    // setNeedsCleanup(true)
    const promise = new Promise((resolve, reject) => {
      setConfirm({
        prompt,
        isOpen: true,
        proceed: resolve,
        cancel: reject
      })
    })
    return promise.then(
      () => {
        setConfirm({ ...confirm, isOpen: false })
        return true
      },
      () => {
        setConfirm({ ...confirm, isOpen: false })
        return false
      }
    )
  }

  // useEffect(() => {
  //   return () => {
  //     if (confirm.cancel && needsCleanup) {
  //       confirm.cancel()
  //     }
  //   }
  // }, [confirm, needsCleanup])

  return {
    ...confirm,
    isConfirmed
  }
}

export default useConfirm
