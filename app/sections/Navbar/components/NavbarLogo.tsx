import Link from 'next/link';

export const NavbarLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base text-white transition-transform duration-300 group-hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #cda552 0%, #9a7635 100%)',
          boxShadow: '0 4px 15px rgba(205,165,82,0.3)',
        }}
      >
        S
      </div>
      <div className="flex flex-col text-left">
        <span className="text-base font-extrabold tracking-widest text-white leading-none">
          SODFA
        </span>
        <span className="text-[10px] tracking-widest uppercase font-medium leading-tight text-[#cda552]/80">
          Marketplace
        </span>
      </div>
    </Link>
  );
};