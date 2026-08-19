export type OrderStepProps = {
  stepNumber: string;
  title: string;
  description: string;
};

export const OrderStep = (props: OrderStepProps) => {
  return (
    <div className="text-center p-2">
      <div className="items-center bg-teal-950 text-orange-400 grid text-2xl font-bold h-[54px] justify-items-center leading-[40.8px] w-[54px] mb-3.5 mx-auto rounded-[50%] font-amiri">
        {props.stepNumber}
      </div>
      <h4 className="text-teal-950 text-[17.6px] font-bold leading-[17.6px] break-words mb-1 font-inter">
        {props.title}
      </h4>
      <p className="text-stone-500 text-[14.72px] leading-[25.024px] break-words">
        {props.description}
      </p>
    </div>
  );
};
