const markets = [
  { name: "Joshua Tree", role: "Home base", className: "swap-node--desert" },
  { name: "Los Angeles", role: "Major market", className: "swap-node--la" },
  { name: "San Diego", role: "Growing scene", className: "swap-node--sd" },
];

export function SwapNetwork() {
  return <div className="swap-network" aria-label="Ødin talent exchange between Joshua Tree, Los Angeles, and San Diego"><div className="swap-lines" aria-hidden="true"><i /><i /><i /></div>{markets.map((market) => <div key={market.name} className={`swap-node ${market.className}`}><span className="swap-node-dot" /><p>{market.name}</p><small>{market.role}</small></div>)}<p className="swap-network-status"><span className="live-dot" />Pilot exchange lanes</p></div>;
}
