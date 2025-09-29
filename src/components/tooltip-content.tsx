import type { RemixiconComponentType } from "@remixicon/react"
import type { ReactNode } from "react"

export function TooltipContentContainer({ children, title, icon: Icon }: { children: ReactNode, title: string, icon: RemixiconComponentType }) {
    return (
        <div className="bg-white border-2 border-neutral-200 rounded-xl">
            <div className="flex items-center gap-1 p-2 border-b-2 border-neutral-200 border-dashed font-bold uppercase text-blue-500">
                <Icon size={16} />
                {title}
            </div>
            <div className="p-2 flex flex-col gap-1">
                {children}
            </div>
        </div>
    )
}

export function TooltipContentElement({ title, children, icon: Icon }: { title: string, children: ReactNode, icon: RemixiconComponentType }) {
    return (
        <div className="flex items-center gap-1">
            <Icon size={16} />
            <span className="font-semibold">{title}</span>
            {" "}
            {children}
        </div>
    )
}
