import Image from "next/image"

interface EmptyStateProps {
  header: string
  description?: string
  imageURL?: string
  primaryAction?: React.ReactNode
}

const EmptyState = ({
  header,
  description,
  imageURL,
  primaryAction
}: EmptyStateProps) => {
  return (
    <div className="text-center">
      {imageURL && <Image src={imageURL} width={256} height={256} alt="" />}
      <h3 className="mt-2 text-xl font-medium text-gray-900">{header}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-6">{primaryAction}</div>
    </div>
  )
}

export default EmptyState
