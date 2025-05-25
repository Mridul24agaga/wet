"use client"

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number
    name: string
    designation: string
    image: string
  }[]
}) => {
  // Removed hover state and animations
  return (
    <div className="flex">
      {items.map((item, idx) => (
        <div className="relative -mr-4" key={item.name}>
          <img
            height={40}
            width={40}
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover object-top"
          />
        </div>
      ))}
    </div>
  )
}
