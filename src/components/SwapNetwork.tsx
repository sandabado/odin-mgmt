"use client";

import { useState } from "react";

const markets = [
  { className: "swap-map__market--joshua", description: "The desert return: a reciprocal room for artists who brought their audience to the coast.", labelX: 520, labelY: 151, name: "Joshua Tree", role: "Home base", x: 500, y: 164 },
  { className: "swap-map__market--la", description: "The major-market handoff: partner artists, venue relationships, and two audiences in one room.", labelX: 102, labelY: 312, name: "Los Angeles", role: "Major market", x: 287, y: 324 },
  { className: "swap-map__market--sd", description: "A growing scene connected through trusted bills and a clear path back through the network.", labelX: 378, labelY: 504, name: "San Diego", role: "Growing scene", x: 357, y: 474 },
] as const;

export function SwapNetwork() {
  const [activeMarket, setActiveMarket] = useState<(typeof markets)[number]>(markets[0]);

  return (
    <figure className="swap-network">
      <svg aria-labelledby="exchange-map-title exchange-map-description" className="swap-map" preserveAspectRatio="xMidYMid slice" role="img" viewBox="0 0 680 580" xmlns="http://www.w3.org/2000/svg">
        <title id="exchange-map-title">ØDIN exchange routes across Southern California</title>
        <desc id="exchange-map-description">A map connecting Joshua Tree, Los Angeles, and San Diego in a three-city artist exchange.</desc>
        <defs>
          <linearGradient id="swap-land" x1=".15" x2=".9" y1=".08" y2="1"><stop stopColor="#28234c" /><stop offset=".5" stopColor="#1d1a37" /><stop offset="1" stopColor="#15142a" /></linearGradient>
          <linearGradient id="swap-route" x1=".1" x2=".95" y1=".1" y2=".9"><stop stopColor="#bcecff" /><stop offset=".53" stopColor="#d3b9ff" /><stop offset="1" stopColor="#91e0cb" /></linearGradient>
          <filter id="swap-glow" height="180%" width="180%" x="-40%" y="-40%"><feGaussianBlur result="blur" stdDeviation="4" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <pattern height="34" id="swap-grid" patternUnits="userSpaceOnUse" width="34"><path d="M 34 0 L 0 0 0 34" fill="none" stroke="rgba(215,210,255,.12)" strokeWidth=".7" /></pattern>
        </defs>

        <rect className="swap-map__ocean" height="580" width="680" />
        <path className="swap-map__land" d="M286 0H680V580H308c31-52 37-89 26-125-14-45-41-73-31-116 10-43 40-73 25-114-16-43-48-71-36-111 13-45 47-78 28-128-13-34-27-61-34-100Z" />
        <path className="swap-map__coast" d="M286 0c7 39 21 66 34 100 19 50-15 83-28 128-12 40 20 68 36 111 15 41-15 71-25 114-10 43 17 71 31 116 11 36 5 73-26 125" />
        <path className="swap-map__border" d="M469 0c-8 61 12 111 43 151 30 39 44 79 25 132-19 53 22 99 58 130 31 27 54 65 85 109" />
        <path className="swap-map__terrain" d="M352 96c71-25 128-18 179 23M335 199c94-30 174-16 229 35M353 303c73-26 148-19 211 25M346 410c91-20 170-7 229 39M379 492c64-10 133 1 193 31" />
        <path className="swap-map__roads" d="M500 164 287 324 357 474Z" />
        <rect className="swap-map__grid" height="580" width="680" />

        {markets.map((market) => <g
          aria-label={`${market.name}: ${market.role}`}
          className={`swap-map__market ${market.className}${activeMarket.name === market.name ? " swap-map__market--active" : ""}`}
          key={market.name}
          onClick={() => setActiveMarket(market)}
          onFocus={() => setActiveMarket(market)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setActiveMarket(market);
            }
          }}
          onPointerEnter={() => setActiveMarket(market)}
          role="button"
          tabIndex={0}
        >
          <g transform={`translate(${market.x} ${market.y})`}><circle className="swap-map__halo" r="20" /><circle className="swap-map__point" r="7" /><circle className="swap-map__core" r="2.4" /></g>
          <g className="swap-map__label" transform={`translate(${market.labelX} ${market.labelY})`}><text>{market.name}</text><tspan x="0" y="17">{market.role}</tspan></g>
        </g>)}
        <g className="swap-map__north" transform="translate(620 54)"><path d="M0 20 8 0l8 20-8-5Z" /><text x="8" y="36">N</text></g>
        <text className="swap-map__ocean-label" transform="translate(87 338) rotate(-90)">PACIFIC OCEAN</text>
      </svg>
      <figcaption><p className="swap-network-status"><span className="live-dot" />Pilot exchange lanes · Southern California</p><div className="swap-network-detail" aria-live="polite"><p>{activeMarket.role}</p><strong>{activeMarket.name}</strong><span>{activeMarket.description}</span></div></figcaption>
    </figure>
  );
}
