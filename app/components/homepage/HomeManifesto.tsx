import Link from "next/link";

const principles = [
  { number: "01", title: "Made in Surat", note: "A small, hands-on atelier" },
  { number: "02", title: "Made with intent", note: "Considered at every step" },
  { number: "03", title: "Made to be kept", note: "For your moments, and theirs" },
];

export function HomeManifesto() {
  return (
    <section className="home-manifesto" aria-labelledby="home-manifesto-title">
      <div className="home-manifesto__intro">
        <p className="home-manifesto__eyebrow">AURJA / SHAPED FOR STORIES</p>
        <h2 id="home-manifesto-title">
          Not made for a moment.
          <br />
          <em>Made to become part of it.</em>
        </h2>
      </div>

      <div className="home-manifesto__footer">
        <p className="home-manifesto__note">
          Jewellery with a little more meaning, from the first sketch to the
          stories that come after.
        </p>
        <div className="home-manifesto__principles">
          {principles.map((principle) => (
            <div className="home-manifesto__principle" key={principle.number}>
              <span className="home-manifesto__number">{principle.number}</span>
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.note}</p>
              </div>
            </div>
          ))}
        </div>
        <Link className="home-manifesto__story-link" href="/story">
          The story behind AURJA <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}