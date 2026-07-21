import Image from "next/image";

export type CaliforniaCoastMapProps = {
  className?: string;
};

type ExchangeMarket = {
  id: "los-angeles" | "joshua-tree" | "san-diego";
  name: string;
  role: string;
};

const exchangeMarkets: ExchangeMarket[] = [
  { id: "los-angeles", name: "Los Angeles", role: "City signal" },
  { id: "joshua-tree", name: "Joshua Tree", role: "Desert anchor" },
  { id: "san-diego", name: "San Diego", role: "Coastal signal" },
];

/** A static, decorative California satellite field for the public exchange story. */
export function CaliforniaCoastMap({ className = "" }: CaliforniaCoastMapProps) {
  return (
    <div aria-hidden="true" className={`california-coast-map ${className}`.trim()}>
      <Image
        alt=""
        fill
        sizes="(min-width: 768px) 100vw, 1px"
        src="/california-coast-map.png"
      />
      <div className="exchange-map-overlay">
        <svg className="exchange-map-routes" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path className="exchange-map-route exchange-map-route--base" d="M 66 61 L 75 59 L 71 76 Z" vectorEffect="non-scaling-stroke" />
          <path className="exchange-map-route exchange-map-route--signal" d="M 66 61 L 75 59 L 71 76 Z" vectorEffect="non-scaling-stroke" />
        </svg>
        {exchangeMarkets.map((market, index) => (
          <div className={`exchange-map-market exchange-map-market--${market.id}`} key={market.id}>
            <span className="exchange-map-market__ring" />
            <span className="exchange-map-market__ring exchange-map-market__ring--delay" />
            <span className="exchange-map-market__core">{String(index + 1).padStart(2, "0")}</span>
            <span className="exchange-map-market__label"><strong>{market.name}</strong><small>{market.role}</small></span>
          </div>
        ))}
        <p className="exchange-map-frequency"><span />Reciprocal route signal · live field</p>
      </div>
    </div>
  );
}
