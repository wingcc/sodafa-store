export type TestimonialCardProps = {
  rating: string;
  testimonial: string;
  initial: string;
  name: string;
  location: string;
};

export const TestimonialCard = (props: TestimonialCardProps) => {
  return (
    <div className="bg-stone-50 shadow-[rgba(15,61,49,0.4)_0px_10px_30px_-24px] border border-stone-300 p-6 rounded-[18px] border-solid">
      <div className="text-yellow-600 tracking-[2px] mb-2.5">
        {props.rating}
      </div>
      <p className="text-stone-700 text-[15.68px] leading-[26.656px] break-words">
        {props.testimonial}
      </p>
      <div className="items-center gap-x-[11px] flex gap-y-[11px] mt-3.5">
        <span className="items-center bg-teal-950 text-white grid font-bold h-10 justify-items-center min-h-[auto] min-w-[auto] w-10 rounded-[50%] font-amiri">
          {props.initial}
        </span>
        <div className="min-h-[auto] min-w-[auto]">
          <b className="text-[14.72px] font-bold leading-[25.024px]">
            {props.name}
          </b>
          <small className="text-stone-500 mt-1.5 block text-[12.48px] leading-[21.216px]">
            {props.location}
          </small>
        </div>
      </div>
    </div>
  );
};