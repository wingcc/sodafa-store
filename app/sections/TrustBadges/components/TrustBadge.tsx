export type TrustBadgeProps = {
  iconUrl: string;
  title: string;
  description: string;
};

export const TrustBadge = (props: TrustBadgeProps) => {
  return (
    <div className="items-center gap-x-[13px] flex justify-center gap-y-[13px] text-start">
      <span className="items-center bg-orange-400/20 text-orange-400 grid shrink-0 h-10 justify-items-center min-h-[auto] min-w-[auto] w-10 rounded-[50%]">
        <img
          src={props.iconUrl}
          alt="Icon"
          className="h-5 w-5"
        />
      </span>
      <div className="min-h-[auto] min-w-[auto]">
        <b className="text-white block text-[15.36px] font-bold leading-[26.112px]">
          {props.title}
        </b>
        <small className="text-stone-400 text-[12.8px] leading-[21.76px]">
          {props.description}
        </small>
      </div>
    </div>
  );
};