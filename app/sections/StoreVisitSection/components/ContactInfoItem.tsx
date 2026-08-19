export type ContactInfoItemProps = {
  iconSrc: string;
  title: string;
  content: string;
  contentClassName: string;
  href?: string;
  iconBg?: string;
  icon?: string;
};

export const ContactInfoItem = (props: ContactInfoItemProps) => {
  return (
    <div className="items-start gap-x-[13px] flex gap-y-[13px] mb-4">
      <span
        className="items-center text-orange-400 grid shrink-0 h-10 justify-items-center min-h-[auto] min-w-[auto] w-10 rounded-[10px]"
        style={{ backgroundColor: props.iconBg || 'rgba(251, 146, 60, 0.2)' }}
      >
        <img
          src={props.iconSrc}
          alt="Icon"
          className="h-5 w-5"
        />
      </span>
      <div className="min-h-[auto] min-w-[auto]">
        <b className="text-white block font-bold">
          {props.title}
        </b>
        {props.href ? (
          <a href={props.href} className={props.contentClassName}>
            {props.content}
          </a>
        ) : (
          <span className={props.contentClassName}>{props.content}</span>
        )}
      </div>
    </div>
  );
};
