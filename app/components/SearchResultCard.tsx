// components/SearchResultCard.tsx
interface SearchResultCardProps {
  title?: string;
  price?: number;
}

export const SearchResultCard = ({ title = "GANDORA", price = 299 }: SearchResultCardProps) => {
  return (
    <li className="shrink-0 relative snap-start z-[1] scroll-mt-[35.2px] scroll-mb-[52px]">
      <div className="block h-full">
        <div className="flex flex-col h-full relative gap-y-2">
          <a href="/products/azerty" className="block absolute decoration-transparent underline decoration-[1.05px] underline-offset-[1.75px] z-[1] inset-0"></a>
          <div>
            <div className="aspect-[4/5] bg-black/10 text-lg leading-[21.6px] p-[11.2px]">
              {title}
            </div>
          </div>
          <div className="gap-x-0.5 flex flex-col gap-y-0.5">
            <p className="flow-root leading-[18.2px] break-words overflow-hidden">{title}</p>
            <div>
              <span className="font-medium text-nowrap">{price}.00 dh</span>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};