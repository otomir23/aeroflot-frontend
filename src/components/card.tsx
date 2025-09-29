import type { RemixiconComponentType } from "@remixicon/react"
import type { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

export default function Card(
    { title, description, children, className, icon: Icon }: {
        title: string,
        description: string,
        children: ReactNode,
        className?: string,
        icon: RemixiconComponentType,
    },
) {
    return (
        <div className="flex-1">
            <div className="flex flex-col gap-0.5 pb-4">
                <div className="font-medium text-lg flex items-center gap-1">
                    <Icon size={16} />
                    {title}
                </div>
                <div className="text-neutral-600 text-sm">
                    {description}
                </div>
            </div>
            <div className={twMerge("p-4 border border-neutral-200 bg-neutral-50 h-96", className)}>
                {children}
            </div>
        </div>
    )
}
