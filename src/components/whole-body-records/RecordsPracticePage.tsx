import Link from "next/link";
import { RecordsCurrentDivider } from "./brand/RecordsCurrentDivider";
import styles from "./RecordsPracticePage.module.css";

export interface RecordsPracticeAction {
  href: string;
  label: string;
  primary?: boolean;
}

export interface RecordsPracticeChapter {
  body: string;
  eyebrow: string;
  points?: readonly string[];
  title: string;
}

export interface RecordsPracticeBoundary {
  body: string;
  eyebrow: string;
  points?: readonly string[];
  title: string;
}

export interface RecordsPracticePageProps {
  actions: readonly RecordsPracticeAction[];
  boundary: RecordsPracticeBoundary;
  chapters: readonly RecordsPracticeChapter[];
  introduction: string;
  introductionEyebrow: string;
  introductionTitle: string;
}

/**
 * Shared public room for the label's secondary practices.
 *
 * The room describes a path into the work without presenting private ØDIN
 * records, unpublished relationships, or unapproved commercial terms.
 */
export function RecordsPracticePage({
  actions,
  boundary,
  chapters,
  introduction,
  introductionEyebrow,
  introductionTitle,
}: RecordsPracticePageProps) {
  return (
    <>
      <section className={styles.introduction} data-records-reveal="">
        <p className="records-index">{introductionEyebrow}</p>
        <div>
          <h2>{introductionTitle}</h2>
          <p>{introduction}</p>
        </div>
      </section>

      <RecordsCurrentDivider className={styles.divider} tone="on-void" />

      <section className={styles.current} data-records-reveal="">
        <p className="records-index">The working current</p>
        <ol>
          {chapters.map((chapter, index) => (
            <li key={chapter.title}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="records-kicker">{chapter.eyebrow}</p>
              <h2>{chapter.title}</h2>
              <p>{chapter.body}</p>
              {chapter.points?.length ? (
                <ul>
                  {chapter.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.boundary} data-records-reveal="">
        <div>
          <p className="records-kicker">{boundary.eyebrow}</p>
          <h2>{boundary.title}</h2>
          <p>{boundary.body}</p>
        </div>
        {boundary.points?.length ? (
          <ul>
            {boundary.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className={styles.actions} data-records-reveal="">
        <p className="records-index">Enter with context</p>
        <div>
          {actions.map((action) => (
            <Link
              className={`records-button ${action.primary ? "records-button--solid" : "records-button--quiet"}`}
              href={action.href}
              key={`${action.href}-${action.label}`}
            >
              {action.label} <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
