"use client";

export type SectionHeaderProps = {
  label: string;
  title: string;
  description?: string;
};


export const SectionHeader = (props: SectionHeaderProps) => {
  return (
    <div className="max-w-[560px] text-center mb-10 mx-auto">
      <span className="items-center text-yellow-600 gap-x-2.5 inline-flex text-[13.12px] font-bold tracking-[2.3616px] leading-[22.304px] gap-y-2.5 uppercase before:accent-auto before:bg-yellow-600 before:caret-transparent before:text-yellow-600 before:block before:text-[13.12px] before:not-italic before:normal-nums before:font-bold before:h-px before:tracking-[2.3616px] before:leading-[22.304px] before:list-outside before:list-disc before:min-h-[auto] before:min-w-[auto] before: before:pointer-events-auto before:text-center before:no-underline before:indent-[0px] before:uppercase before:visible before:w-[26px] before:border-separate before:font-tajawal">
        {props.label}
      </span>
      <h2 className="text-teal-950 text-[30.4px] font-bold leading-[45.6px] break-words mt-3.5 mb-2 font-amiri md:text-[43.2px] md:leading-[43.2px]">
        {props.title}
      </h2>
      {props.description ? (
        <p className="text-stone-500 break-words">
          {props.description}
        </p>
      ) : null}
    </div>
  );
};