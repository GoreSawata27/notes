import Link from "next/link";
import { STUDY_PLAN } from "@/lib/notes/topics";
import type { HubCard } from "@/lib/notes/types";

function CardGrid({ cards, company }: { cards: HubCard[]; company?: boolean }) {
  return (
    <div className={company ? "cards cards-company" : "cards"}>
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className={card.company ? "card card-company" : "card"}
        >
          {card.badge ? <span className="company-badge">{card.badge}</span> : null}
          <strong>{card.title}</strong>
          <span>{card.description}</span>
          <span className="meta">{card.meta}</span>
        </Link>
      ))}
    </div>
  );
}

export function NotesHub({
  totalQuestions,
  core,
  cheatsheets,
  company,
  playground,
}: {
  totalQuestions: number;
  core: HubCard[];
  cheatsheets: HubCard[];
  company: HubCard[];
  playground: HubCard[];
}) {
  return (
    <div className="hub-page">
      <h1 className="hub-brand">
        Frontend <span>Interview Notes</span>
      </h1>
      <p className="hub-lede">
        Interview Q&amp;A, JS cheatsheets, and live practice in one app — {totalQuestions} questions
        with spoken answers, plus concept cards and machine-coding demos.
      </p>

      <h2 className="hub-section-title">Core Topics</h2>
      <CardGrid cards={core} />

      <h2 className="hub-section-title">JS Cheatsheets</h2>
      <CardGrid cards={cheatsheets} />

      <h2 className="hub-section-title hub-section-company">Company Prep</h2>
      <CardGrid cards={company} company />

      <h2 className="hub-section-title">Practice &amp; Learn</h2>
      <CardGrid cards={playground} />

      <section className="study-panel">
        <h2>10-week study plan</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Topics</th>
              <th>Focus</th>
            </tr>
          </thead>
          <tbody>
            {STUDY_PLAN.map((row) => (
              <tr key={row.week}>
                <td>{row.week}</td>
                <td>{row.topics}</td>
                <td>{row.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="hub-foot">Q&amp;A from Markdown · JS snippets as cards · Practice and Learn stay interactive</p>
    </div>
  );
}
