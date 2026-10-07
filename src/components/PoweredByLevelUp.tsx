// "Built by LevelUp Ecosystem" credit shown in the footer of every LevelUp client
// site. Whether it renders is controlled by LevelUp in the database
// (websites.show_powered_by), not by the site owner.
interface PoweredByLevelUpProps {
  domain?: string | null;
  className?: string;
}

const LEVELUP_URL = 'https://levelup-ecosystem.com';

export default function PoweredByLevelUp({ domain, className = '' }: PoweredByLevelUpProps) {
  const href = `${LEVELUP_URL}/?utm_source=${encodeURIComponent(domain || 'client-site')}&utm_medium=referral&utm_campaign=built_by`;

  return (
    <a
      href={href}
      target='_blank'
      rel='noopener'
      aria-label='Built by LevelUp Ecosystem (opens in a new tab)'
      className={`group inline-flex items-center gap-2 text-gray-500 hover:text-gray-200 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm ${className}`}
    >
      <span className='text-[10px] uppercase tracking-[0.2em] font-mono'>Built by</span>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 1000 220'
        fill='none'
        className='h-4 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-200'
        aria-hidden='true'
        focusable='false'
      >
        <defs>
          <linearGradient id='lu-built-by-top' x1='500' y1='10' x2='500' y2='90' gradientUnits='userSpaceOnUse'>
            <stop stopColor='currentColor' stopOpacity='0.95' />
            <stop offset='1' stopColor='currentColor' stopOpacity='0.8' />
          </linearGradient>
          <linearGradient id='lu-built-by-bottom' x1='500' y1='95' x2='500' y2='205' gradientUnits='userSpaceOnUse'>
            <stop stopColor='currentColor' stopOpacity='0.75' />
            <stop offset='1' stopColor='currentColor' stopOpacity='0.45' />
          </linearGradient>
        </defs>
        <text
          x='50%'
          y='85'
          textAnchor='middle'
          fill='url(#lu-built-by-top)'
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'DM Sans', sans-serif"
          fontSize='100px'
          fontWeight='900'
          letterSpacing='-0.01em'
        >
          LevelUp
        </text>
        <text
          x='50%'
          y='198'
          textAnchor='middle'
          fill='url(#lu-built-by-bottom)'
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'DM Sans', sans-serif"
          fontSize='135px'
          fontWeight='900'
          letterSpacing='0.01em'
        >
          Ecosystem
        </text>
      </svg>
    </a>
  );
}
