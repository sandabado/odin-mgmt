import type { RecordsService } from "@/lib/records-site-data";

export interface RecordsServiceCardProps {
  service: RecordsService;
}

export function RecordsServiceCard({ service }: RecordsServiceCardProps) {
  return (
    <article className="records-service-card">
      <div className="records-service-card__summary">
        <span>{service.number}</span>
        <p className="records-kicker">{service.principle}</p>
        <h3>{service.name}</h3>
        <p>{service.summary}</p>
      </div>
      <details className="records-service-card__details">
        <summary>
          Explore service
          <span aria-hidden="true">+</span>
        </summary>
        <div className="records-service-card__body">
          <h4>{service.detailTitle}</h4>
          <div className="records-service-card__columns">
            <div>
              <h5>We provide</h5>
              <ul>
                {service.provides.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5>What we don’t do</h5>
              <ul>
                {service.boundaries.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="records-service-card__facts">
            {service.detailSections.map((section) => (
              <div key={section.title}>
                <h5>{section.title}</h5>
                {section.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </details>
    </article>
  );
}
