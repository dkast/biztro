import Spinner from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="absolute inset-0 z-20 flex grow items-center justify-center bg-blue-300">
      <Spinner />
    </div>
  )
}
